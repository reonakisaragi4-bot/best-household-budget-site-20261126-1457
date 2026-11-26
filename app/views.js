// The five pages. Each view is a function of the ledger state plus a small
// `ui` object (filters, which story is open, which budget is being edited)
// and returns the page's HTML. main.js drops it into #page and wires the
// buttons; nothing here touches localStorage or the network.

import {
  HOUSEHOLD, ACCOUNTS, CATEGORIES, MONTHLY_HISTORY, categoryById,
  monthTotals, currentBalance, totalBudget, spendByCategory,
  donutSlices, biggestExpenses, sortNewest,
} from "./data.js";
import { rp, rpShort, dayLabel, dueLabel, monthLabel, monthLong, pctOf, esc } from "./format.js";
import { donutSvg, monthBarsSvg } from "./charts.js";

function sortedTx(state) {
  return sortNewest(state.transactions);
}

function catDot(cat) {
  return `<span class="dot" style="background:${cat.color}"></span>`;
}

function txRow(t) {
  const cat = categoryById(t.cat);
  const sign = t.kind === "in" ? "+ " : "− ";
  const cls = t.kind === "in" ? "amount-in" : "amount-out";
  return `<tr>
    <td>${dayLabel(t.date)}</td>
    <td>${catDot(cat)} ${esc(cat.label)}</td>
    <td>${esc(t.note)}</td>
    <td>${esc(t.account)}</td>
    <td class="${cls}">${sign}${rp(t.amount)}</td>
    <td class="row-actions"><button type="button" data-action="edit-tx" data-id="${t.id}">Edit</button>
    <button type="button" class="danger-text" data-action="delete-tx" data-id="${t.id}">Delete</button></td>
  </tr>`;
}

function txTable(rows) {
  return `<div class="table-scroll"><table class="ledger">
    <thead><tr><th>Date</th><th>Category</th><th>Note</th><th>Account</th><th class="num">Amount</th><th></th></tr></thead>
    <tbody>${rows.map(txRow).join("")}</tbody>
  </table></div>`;
}

// ---- Overview -----------------------------------------------------------

export function viewOverview(state, ui) {
  const totals = monthTotals(state);
  const balance = currentBalance(state);
  const budget = totalBudget(state);
  const left = budget - totals.spent;
  const daysLeft = HOUSEHOLD.monthDays - HOUSEHOLD.dayToday;
  const daily = daysLeft > 0 ? Math.round(left / daysLeft) : left;
  const slices = donutSlices(state);
  const unpaid = state.bills.filter((b) => !b.paid);
  const recent = sortedTx(state).slice(0, 7);
  const legend = slices.map((s) => `<li>${catDot(s.cat)}<span class="legend-label">${esc(s.cat.label)}</span><strong>${rp(s.spent)}</strong></li>`).join("");
  const bills = unpaid.map((b) => `<li class="bill">
      <div><strong>${esc(b.name)}</strong><span class="muted">Due ${dueLabel(b.due)}</span></div>
      <strong>${rp(b.amount)}</strong>
      <button type="button" data-action="pay-bill" data-id="${b.id}">Pay now</button>
    </li>`).join("");
  const goalCards = state.goals.map((g) => {
    const pct = pctOf(g.saved, g.target);
    const done = g.saved >= g.target;
    return `<div class="goal-mini">
      <div class="goal-mini-head"><strong>${esc(g.name)}</strong><span>${rp(g.saved)} / ${rp(g.target)}</span></div>
      <div class="bar"><span style="width:${Math.min(pct, 100)}%"></span></div>
      <div class="muted">${done ? "Complete ✓" : pct + "% funded · " + rp(g.target - g.saved) + " to go"}</div>
    </div>`;
  }).join("");

  return `
  <h1>November budget at a glance</h1>
  <p class="lede">${esc(HOUSEHOLD.name)} — ${esc(HOUSEHOLD.members)}. Four days left in November; every figure below is live from the ledger.</p>

  <div class="grid stats">
    <div class="card stat"><span class="stat-label">Balance now</span><strong class="stat-value">${rp(balance)}</strong><span class="muted">Opening ${rp(HOUSEHOLD.openingBalance)} + this month's net</span></div>
    <div class="card stat"><span class="stat-label">Income in November</span><strong class="stat-value green"> ${rp(totals.income)}</strong><span class="muted">Salary, freelance and interest</span></div>
    <div class="card stat"><span class="stat-label">Spent in November</span><strong class="stat-value red">${rp(totals.spent)}</strong><span class="muted">of a ${rp(budget)} monthly budget</span></div>
  </div>

  <div class="grid grid-main">
    <section class="card">
      <h2>Where the money went</h2>
      <p class="muted">Spending by category, November 2026.</p>
      <div class="donut-wrap">${donutSvg(slices, totals.spent)}
        <ul class="legend">${legend}</ul>
      </div>
      <p><strong class="green">${rp(left)} left</strong> of the monthly budget — about <strong>${rp(daily)} a day</strong> for the last ${daysLeft} days.</p>
    </section>

    <section class="card">
      <h2>Upcoming bills</h2>
      <p class="muted">${unpaid.length} bill${unpaid.length === 1 ? "" : "s"} still to pay in December.</p>
      <ul class="bills">${bills || `<li class="muted">All December bills are paid.</li>`}</ul>
      <p class="muted">Paying a bill adds it to Transactions as an expense on today's date.</p>
    </section>
  </div>

  <div class="grid grid-main">
    <section class="card">
      <h2>Recent transactions</h2>
      ${txTable(recent)}
      <p><a href="#/transactions">See all ${state.transactions.length} November transactions →</a></p>
    </section>
    <section class="card">
      <h2>Savings goals</h2>
      ${goalCards}
      <p><a href="#/goals">Manage goals →</a></p>
    </section>
  </div>`;
}

// ---- Transactions --------------------------------------------------------

export function viewTransactions(state, ui) {
  const f = ui.filters;
  const rows = sortedTx(state).filter((t) => {
    if (f.kind !== "all" && t.kind !== f.kind) return false;
    if (f.cat !== "all" && t.cat !== f.cat) return false;
    if (f.q) {
      const hay = (t.note + " " + t.account + " " + categoryById(t.cat).label).toLowerCase();
      if (!hay.includes(f.q.toLowerCase())) return false;
    }
    return true;
  });
  const income = rows.filter((t) => t.kind === "in").reduce((s, t) => s + t.amount, 0);
  const spent = rows.filter((t) => t.kind === "out").reduce((s, t) => s + t.amount, 0);
  const catOptions = CATEGORIES.map((c) => `<option value="${c.id}" ${f.cat === c.id ? "selected" : ""}>${esc(c.label)}</option>`).join("");

  return `
  <h1>Transactions — November 2026</h1>
  <p class="lede">Every rupiah in and out this month. Add one, fix a note, or delete a mistake — the totals below update at once.</p>

  <section class="card">
    <div class="filters">
      <label>Search <input type="search" id="f-q" placeholder="e.g. Super Indo" value="${esc(f.q)}"></label>
      <label>Type <select id="f-kind">
        <option value="all" ${f.kind === "all" ? "selected" : ""}>All</option>
        <option value="in" ${f.kind === "in" ? "selected" : ""}>Income</option>
        <option value="out" ${f.kind === "out" ? "selected" : ""}>Expenses</option>
      </select></label>
      <label>Category <select id="f-cat">
        <option value="all">All categories</option>${catOptions}
      </select></label>
      <button type="button" data-action="reset-filters">Reset filters</button>
    </div>

    <p class="totals-line">Showing <strong>${rows.length}</strong> transaction${rows.length === 1 ? "" : "s"}&nbsp;&nbsp;
      Income <strong class="green">${rp(income)}</strong>&nbsp;&nbsp;
      Expenses <strong class="red">${rp(spent)}</strong>&nbsp;&nbsp;
      Net <strong>${rp(income - spent)}</strong></p>

    ${rows.length ? txTable(rows) : `<p class="muted">Nothing matches those filters. Try clearing the search.</p>`}
  </section>`;
}

// ---- Budgets -------------------------------------------------------------

export function viewBudgets(state, ui) {
  const totals = monthTotals(state);
  const budget = totalBudget(state);
  const spentById = new Map(spendByCategory(state).map((r) => [r.cat.id, r.spent]));
  const rows = CATEGORIES.filter((c) => c.id !== "income").map((c) => {
    const spent = spentById.get(c.id) || 0;
    const limit = state.limits[c.id] || 0;
    const pct = pctOf(spent, limit);
    const over = spent > limit;
    const left = limit - spent;
    const barClass = over ? "bar-over" : pct >= 80 ? "bar-warm" : "bar-ok";
    const editor = ui.editingBudget === c.id ? `
      <form class="inline-form" data-form="budget" data-cat="${c.id}">
        <label>Monthly budget (Rp) <input type="number" name="limit" min="0" step="5000" value="${limit}" required></label>
        <button type="submit">Save</button>
        <button type="button" data-action="cancel-budget-edit">Cancel</button>
      </form>` : "";
    return `<div class="budget-row">
      <div class="budget-head"><strong>${catDot(c)} ${esc(c.label)}</strong>
        <span><strong>${rp(spent)}</strong> of ${rp(limit)} (${pct}%)</span></div>
      <div class="bar big"><span class="${barClass}" style="width:${Math.min(pct, 100)}%"></span></div>
      <div class="budget-foot">
        <span class="${over ? "red" : "green"}"><strong>${over ? rp(spent - limit) + " over budget" : rp(left) + " left"}</strong></span>
        <button type="button" data-action="edit-budget" data-id="${c.id}">Change budget</button>
      </div>
      ${editor}
    </div>`;
  }).join("");

  return `
  <h1>Monthly budgets — November 2026</h1>
  <p class="lede">One limit per category. The bars fill as spending lands; change any limit and the overview updates with it.</p>
  <section class="card">
    <p class="totals-line">Total budget <strong>${rp(budget)}</strong>&nbsp;&nbsp;
      Spent so far <strong class="red">${rp(totals.spent)}</strong>&nbsp;&nbsp;
      Remaining <strong class="green">${rp(budget - totals.spent)}</strong></p>
    ${rows}
  </section>`;
}

// ---- Savings goals -------------------------------------------------------

export function viewGoals(state, ui) {
  const savedTotal = state.goals.reduce((s, g) => s + g.saved, 0);
  const targetTotal = state.goals.reduce((s, g) => s + g.target, 0);
  const cards = state.goals.map((g) => {
    const pct = pctOf(g.saved, g.target);
    const done = g.saved >= g.target;
    const story = ui.openStory === g.id ? `<p class="story">${esc(g.story)}</p>` : "";
    const deposit = ui.depositGoal === g.id ? `
      <form class="inline-form" data-form="deposit" data-goal="${g.id}">
        <p class="muted">${esc(g.name)}: ${rp(g.saved)} saved of ${rp(g.target)} target. The deposit comes out of the everyday balance.</p>
        <label>Amount (Rp) <input type="number" name="amount" min="1000" step="1000" required></label>
        <button type="submit">Add to goal</button>
        <button type="button" data-action="cancel-deposit">Cancel</button>
      </form>` : "";
    return `<article class="card goal-card">
      <div class="goal-head"><h2>${esc(g.name)}</h2><span class="muted">Target ${rp(g.target)}</span></div>
      <strong class="goal-saved">${rp(g.saved)}</strong>
      <p class="muted">${esc(g.blurb)}</p>
      <div class="bar big"><span style="width:${Math.min(pct, 100)}%"></span></div>
      <div class="goal-foot"><span>${pct}% funded</span><span>${done ? "Complete ✓" : rp(g.target - g.saved) + " to go"}</span></div>
      <div class="goal-actions">
        ${done ? "" : `<button type="button" class="btn-primary" data-action="deposit-goal" data-id="${g.id}">Add money</button>`}
        <button type="button" data-action="toggle-story" data-id="${g.id}">${ui.openStory === g.id ? "Hide the story" : "Why this goal"}</button>
      </div>
      ${story}${deposit}
    </article>`;
  }).join("");

  return `
  <h1>Savings goals</h1>
  <p class="lede">${rp(savedTotal)} saved across ${state.goals.length} goals, of ${rp(targetTotal)} targeted. Add money to a goal and it moves straight out of the everyday balance.</p>
  <div class="grid goals-grid">${cards}</div>

  <section class="card">
    <h2>New goal</h2>
    <p class="muted">Start saving for something else — a name, a target and a first deposit.</p>
    <form class="goal-form" data-form="new-goal">
      <label>Goal name <input type="text" name="name" maxlength="60" placeholder="e.g. New laptop" required></label>
      <label>Target (Rp) <input type="number" name="target" min="1000" step="1000" placeholder="5000000" required></label>
      <label>First deposit (Rp) <input type="number" name="deposit" min="0" step="1000" value="0" required></label>
      <button type="submit" class="btn-primary">Create goal</button>
    </form>
  </section>`;
}

// ---- Reports -------------------------------------------------------------

export function viewReports(state, ui) {
  const totals = monthTotals(state);
  const rows = spendByCategory(state);
  const days = HOUSEHOLD.dayToday;
  const avgDaily = Math.round(totals.spent / days);
  const biggestCat = rows[0];
  const history = MONTHLY_HISTORY.map((m) => ({
    ...m,
    income: m.month === "2026-11" ? totals.income : m.income,
    expenses: m.month === "2026-11" ? totals.spent : m.expenses,
  }));
  const best = history.slice().sort((a, b) => (b.income - b.expenses) - (a.income - a.expenses))[0];
  const breakdown = rows.map((r) => `<tr>
      <td>${catDot(r.cat)} ${esc(r.cat.label)}</td>
      <td class="num">${rp(r.spent)}</td>
      <td class="num">${pctOf(r.spent, totals.spent)}%</td>
    </tr>`).join("");
  const top5 = biggestExpenses(state, 5).map((t) => `<tr>
      <td>${dayLabel(t.date)}</td>
      <td>${catDot(categoryById(t.cat))} ${esc(categoryById(t.cat).label)}</td>
      <td>${esc(t.note)}</td>
      <td class="num amount-out">− ${rp(t.amount)}</td>
    </tr>`).join("");

  return `
  <h1>Reports — five months of the household</h1>
  <p class="lede">Income against expenses, July to November 2026, and where November's spending actually went.</p>

  <div class="grid stats">
    <div class="card stat"><span class="stat-label">Average daily spend</span><strong class="stat-value">${rp(avgDaily)}</strong><span class="muted">November, over ${days} days</span></div>
    <div class="card stat"><span class="stat-label">Biggest category</span><strong class="stat-value">${esc(biggestCat.cat.label)}</strong><span class="muted">${rp(biggestCat.spent)} — ${pctOf(biggestCat.spent, totals.spent)}% of spending</span></div>
    <div class="card stat"><span class="stat-label">Best saving month</span><strong class="stat-value">${monthLong(best.month)}</strong><span class="muted">${rp(best.income - best.expenses)} saved (income minus expenses)</span></div>
  </div>

  <div class="grid grid-main">
    <section class="card">
      <h2>Income vs expenses by month</h2>
      <p class="legend-line"><span class="swatch in"></span> Income <span class="swatch out"></span> Expenses</p>
      ${monthBarsSvg(history)}
      <p class="muted">November's expenses are live from the ledger; earlier months are the closed books.</p>
    </section>
    <section class="card">
      <h2>November spending breakdown</h2>
      <div class="table-scroll"><table class="ledger">
        <thead><tr><th>Category</th><th class="num">Spent</th><th class="num">Share</th></tr></thead>
        <tbody>${breakdown}</tbody>
      </table></div>
    </section>
  </div>

  <section class="card">
    <h2>Biggest single expenses in November</h2>
    <div class="table-scroll"><table class="ledger">
      <thead><tr><th>Date</th><th>Category</th><th>Note</th><th class="num">Amount</th></tr></thead>
      <tbody>${top5}</tbody>
    </table></div>
    <p class="muted">Rent is the household's largest fixed cost; groceries are the largest cost the family can still steer day to day.</p>
  </section>`;
}

// ---- Add / edit transaction dialog ---------------------------------------

export function txDialog(editing) {
  const isEdit = Boolean(editing);
  const t = editing || { kind: "out", amount: "", cat: "groceries", date: "2026-11-26", note: "", account: ACCOUNTS[0] };
  const cats = CATEGORIES.filter((c) => c.id !== "income" || t.kind === "in")
    .map((c) => `<option value="${c.id}" ${t.cat === c.id ? "selected" : ""}>${esc(c.label)}</option>`).join("");
  const accounts = ACCOUNTS.map((a) => `<option ${t.account === a ? "selected" : ""}>${esc(a)}</option>`).join("");
  return `<div class="overlay" data-overlay>
    <form class="dialog" data-form="tx" ${isEdit ? `data-edit="${t.id}"` : ""}>
      <h2>${isEdit ? "Edit transaction" : "Add transaction"}</h2>
      <fieldset><legend>Type</legend>
        <label><input type="radio" name="kind" value="out" ${t.kind === "out" ? "checked" : ""}> Expense</label>
        <label><input type="radio" name="kind" value="in" ${t.kind === "in" ? "checked" : ""}> Income</label>
      </fieldset>
      <label>Amount (Rp) <input type="number" name="amount" min="1" step="1" value="${t.amount}" required></label>
      <label>Category <select name="cat">${cats}</select></label>
      <label>Date <input type="date" name="date" value="${t.date}" min="2026-11-01" max="2026-11-30" required></label>
      <label>Note <input type="text" name="note" maxlength="80" value="${esc(t.note)}" placeholder="What was this for?" required></label>
      <label>Account <select name="account">${accounts}</select></label>
      <div class="dialog-actions">
        <button type="button" data-action="close-dialog">Cancel</button>
        <button type="submit" class="btn-primary">Save transaction</button>
      </div>
    </form>
  </div>`;
}
