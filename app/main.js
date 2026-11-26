// HearthLedger controller: state, routing, and every control on the page.
// The ledger lives in localStorage (with an in-memory fallback when the
// browser refuses storage), so the site works offline and nothing ever
// leaves this device.

import { freshState, ACCOUNTS } from "./data.js";
import { viewOverview, viewTransactions, viewBudgets, viewGoals, viewReports, txDialog } from "./views.js";

const STORAGE_KEY = "hearthledger-v1";
const ROUTES = {
  overview: viewOverview,
  transactions: viewTransactions,
  budgets: viewBudgets,
  goals: viewGoals,
  reports: viewReports,
};

// ---- Storage -------------------------------------------------------------
// localStorage can throw (private mode, quota, disabled cookies). Keep a
// memory copy as the fallback so the page still works either way.
let memoryCopy = null;

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return memoryCopy;
  }
}

function writeStored(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    memoryCopy = state;
  }
}

function loadState() {
  const saved = readStored();
  if (saved && Array.isArray(saved.transactions) && Array.isArray(saved.goals)) return saved;
  const fresh = freshState();
  writeStored(fresh);
  return fresh;
}

let state = loadState();

// ---- UI state (not saved): filters, open panels, dialog ------------------
const ui = {
  filters: { q: "", kind: "all", cat: "all" },
  openStory: null,
  depositGoal: null,
  editingBudget: null,
  dialogTx: null, // null = no dialog; "new" = add; a transaction = edit
};

const pageEl = document.getElementById("page");
const dialogRoot = document.getElementById("dialog-root");

function route() {
  const hash = window.location.hash.replace(/^#\/?/, "") || "overview";
  return ROUTES[hash] ? hash : "overview";
}

function render() {
  const name = route();
  document.querySelectorAll(".nav-link").forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === "#/" + name);
    if (a.getAttribute("href") === "#/" + name) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  pageEl.innerHTML = ROUTES[name](state, ui);
  renderDialog();
  bindFilters();
}

function renderDialog() {
  if (!ui.dialogTx) {
    dialogRoot.innerHTML = "";
    return;
  }
  dialogRoot.innerHTML = txDialog(ui.dialogTx === "new" ? null : ui.dialogTx);
}

function save() {
  writeStored(state);
}

function todayIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

// ---- Filters (transactions page) -----------------------------------------
function bindFilters() {
  const q = document.getElementById("f-q");
  if (q) q.addEventListener("input", () => { ui.filters.q = q.value; render(); keepFocus("f-q"); });
  const kind = document.getElementById("f-kind");
  if (kind) kind.addEventListener("change", () => { ui.filters.kind = kind.value; render(); });
  const cat = document.getElementById("f-cat");
  if (cat) cat.addEventListener("change", () => { ui.filters.cat = cat.value; render(); });
}

// Re-rendering rebuilds the search box; put the caret back where it was.
function keepFocus(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.focus();
  const len = el.value.length;
  el.setSelectionRange(len, len);
}

// ---- Actions ---------------------------------------------------------------
document.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-action]");
  if (!btn) return;
  const action = btn.dataset.action;

  if (action === "edit-tx") {
    ui.dialogTx = state.transactions.find((t) => t.id === btn.dataset.id) || null;
    renderDialog();
  } else if (action === "delete-tx") {
    const t = state.transactions.find((x) => x.id === btn.dataset.id);
    if (t && window.confirm("Delete this transaction?\n" + t.note)) {
      state.transactions = state.transactions.filter((x) => x.id !== t.id);
      save();
      render();
    }
  } else if (action === "close-dialog") {
    ui.dialogTx = null;
    renderDialog();
  } else if (action === "reset-filters") {
    ui.filters = { q: "", kind: "all", cat: "all" };
    render();
  } else if (action === "pay-bill") {
    const bill = state.bills.find((b) => b.id === btn.dataset.id);
    if (!bill || bill.paid) return;
    bill.paid = true;
    state.transactions.unshift({
      id: "t" + Date.now().toString(36),
      date: todayIso(),
      cat: bill.cat,
      note: bill.name + " — paid",
      account: "BCA — Everyday",
      amount: bill.amount,
      kind: "out",
    });
    save();
    render();
  } else if (action === "edit-budget") {
    ui.editingBudget = btn.dataset.id;
    render();
  } else if (action === "cancel-budget-edit") {
    ui.editingBudget = null;
    render();
  } else if (action === "toggle-story") {
    ui.openStory = ui.openStory === btn.dataset.id ? null : btn.dataset.id;
    render();
  } else if (action === "deposit-goal") {
    ui.depositGoal = btn.dataset.id;
    render();
  } else if (action === "cancel-deposit") {
    ui.depositGoal = null;
    render();
  }
});

// The header's "+ Add transaction" button lives in the static shell.
document.getElementById("add-btn").addEventListener("click", () => {
  ui.dialogTx = "new";
  renderDialog();
});

// The footer's reset link restores the November seed figures.
document.getElementById("reset-link").addEventListener("click", (event) => {
  event.preventDefault();
  if (window.confirm("Reset the ledger to its November starting figures? Your changes will be lost.")) {
    state = freshState();
    ui.openStory = null;
    ui.depositGoal = null;
    ui.editingBudget = null;
    ui.dialogTx = null;
    save();
    render();
  }
});

// Clicking the dimmed area around the dialog closes it.
dialogRoot.addEventListener("click", (event) => {
  if (event.target.hasAttribute("data-overlay")) {
    ui.dialogTx = null;
    renderDialog();
  }
});

// ---- Forms -----------------------------------------------------------------
document.addEventListener("submit", (event) => {
  const form = event.target.closest("[data-form]");
  if (!form) return;
  event.preventDefault();
  const data = new FormData(form);

  if (form.dataset.form === "tx") {
    const kind = data.get("kind") === "in" ? "in" : "out";
    const amount = Math.max(1, Math.round(Number(data.get("amount")) || 0));
    const row = {
      kind,
      amount,
      cat: kind === "in" ? "income" : String(data.get("cat") || "other"),
      date: String(data.get("date") || todayIso()),
      note: String(data.get("note") || "").trim() || "(no note)",
      account: String(data.get("account") || ACCOUNTS[0]),
    };
    if (form.dataset.edit) {
      const t = state.transactions.find((x) => x.id === form.dataset.edit);
      if (t) Object.assign(t, row);
    } else {
      state.transactions.unshift({ id: "t" + Date.now().toString(36), ...row });
    }
    ui.dialogTx = null;
    save();
    render();
  } else if (form.dataset.form === "budget") {
    const limit = Math.max(0, Math.round(Number(data.get("limit")) || 0));
    state.limits[form.dataset.cat] = limit;
    ui.editingBudget = null;
    save();
    render();
  } else if (form.dataset.form === "deposit") {
    const amount = Math.max(0, Math.round(Number(data.get("amount")) || 0));
    const goal = state.goals.find((g) => g.id === form.dataset.goal);
    if (goal && amount > 0) {
      goal.saved = Math.min(goal.target, goal.saved + amount);
      state.movedToGoals += amount;
      ui.depositGoal = null;
      save();
      render();
    }
  } else if (form.dataset.form === "new-goal") {
    const name = String(data.get("name") || "").trim();
    const target = Math.max(1, Math.round(Number(data.get("target")) || 0));
    const deposit = Math.max(0, Math.round(Number(data.get("deposit")) || 0));
    if (name && target > 0) {
      state.goals.push({
        id: "g" + Date.now().toString(36),
        name,
        target,
        saved: Math.min(target, deposit),
        blurb: "A new goal for the Wijaya household.",
        story: "Why: " + name + " is the family's next saving goal.",
      });
      state.movedToGoals += Math.min(target, deposit);
      save();
      render();
    }
  }
});

// Keep the income/expense toggle and the category list in step: income rows
// always use the Income category.
dialogRoot.addEventListener("change", (event) => {
  if (event.target.name !== "kind") return;
  const select = dialogRoot.querySelector('select[name="cat"]');
  if (!select) return;
  if (event.target.value === "in") {
    if (![...select.options].some((o) => o.value === "income")) {
      const opt = document.createElement("option");
      opt.value = "income";
      opt.textContent = "Income";
      select.appendChild(opt);
    }
    select.value = "income";
  } else {
    select.value = "groceries";
  }
});

window.addEventListener("hashchange", render);
render();
