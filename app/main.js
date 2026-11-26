/* HearthLedger main: hash routing, the add-transaction flow, filters, edits,
   bill payments, budget changes and savings goals. All state lives in data.js
   and is saved to localStorage after every change. */

import { HOUSEHOLD, CATEGORIES, categoryById, loadState, saveState, resetState } from './data.js';
import { renderOverview, renderTransactions, renderBudgets, renderGoals, renderReports, mountCharts } from './views.js';
import { todayISO } from './format.js';

let state = loadState();
const view = document.getElementById('view');
const filters = { query: '', type: 'all', category: 'all' };

const ROUTES = {
  overview: () => renderOverview(state),
  transactions: () => renderTransactions(state, filters),
  budgets: () => renderBudgets(state),
  goals: () => renderGoals(state),
  reports: () => renderReports(state),
};

function currentRoute() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  return ROUTES[hash] ? hash : 'overview';
}

function render() {
  const route = currentRoute();
  view.innerHTML = ROUTES[route]();
  document.querySelectorAll('.main-nav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
  });
  mountCharts(state, route);
  bindPage(route);
}

function rerender() {
  saveState(state);
  render();
}

/* ---- add / edit transaction modal ---- */

const backdrop = document.getElementById('modal-backdrop');
const form = document.getElementById('transaction-form');
const categorySelect = document.getElementById('tx-category');
const typeSelect = document.getElementById('tx-type');
const formError = document.getElementById('form-error');
let editingId = null;

function fillCategoryOptions(selected) {
  const type = typeSelect.value;
  const options = type === 'income'
    ? CATEGORIES.filter((c) => c.id === 'income')
    : CATEGORIES.filter((c) => c.id !== 'income');
  categorySelect.innerHTML = options
    .map((c) => '<option value="' + c.id + '"' + (c.id === selected ? ' selected' : '') + '>' + c.name + '</option>')
    .join('');
}

function openTransactionModal(tx) {
  editingId = tx ? tx.id : null;
  document.getElementById('modal-title').textContent = tx ? 'Edit transaction' : 'Add transaction';
  formError.hidden = true;
  if (tx) {
    typeSelect.value = tx.type;
    fillCategoryOptions(tx.category);
    document.getElementById('tx-amount').value = tx.amount;
    document.getElementById('tx-date').value = tx.date;
    document.getElementById('tx-note').value = tx.note;
    document.getElementById('tx-account').value = tx.account;
  } else {
    typeSelect.value = 'expense';
    fillCategoryOptions('groceries');
    document.getElementById('tx-amount').value = '';
    document.getElementById('tx-date').value = todayISO();
    document.getElementById('tx-note').value = '';
    document.getElementById('tx-account').value = 'BCA — Everyday';
  }
  backdrop.hidden = false;
  document.getElementById('tx-amount').focus();
}

function closeTransactionModal() {
  backdrop.hidden = true;
  editingId = null;
}

document.getElementById('add-transaction-btn').addEventListener('click', () => openTransactionModal(null));
document.getElementById('modal-cancel').addEventListener('click', closeTransactionModal);
backdrop.addEventListener('click', (event) => {
  if (event.target === backdrop) closeTransactionModal();
});
typeSelect.addEventListener('change', () => fillCategoryOptions(typeSelect.value === 'income' ? 'income' : 'groceries'));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const amount = Number(document.getElementById('tx-amount').value);
  const date = document.getElementById('tx-date').value;
  const note = document.getElementById('tx-note').value.trim();
  if (!Number.isFinite(amount) || amount <= 0) {
    formError.textContent = 'Enter an amount above Rp 0.';
    formError.hidden = false;
    return;
  }
  if (!date) {
    formError.textContent = 'Pick a date for the transaction.';
    formError.hidden = false;
    return;
  }
  const record = {
    type: typeSelect.value,
    category: categorySelect.value,
    amount: Math.round(amount),
    date,
    note: note || categoryById(categorySelect.value).name,
    account: document.getElementById('tx-account').value,
  };
  if (editingId) {
    const tx = state.transactions.find((t) => t.id === editingId);
    if (tx) Object.assign(tx, record);
  } else {
    state.transactions.push({ id: 'u' + (state.nextId++), ...record });
  }
  closeTransactionModal();
  if (currentRoute() !== 'transactions') window.location.hash = '#/transactions';
  rerender();
});

/* ---- goal modal ---- */

const goalBackdrop = document.getElementById('goal-backdrop');
const goalForm = document.getElementById('goal-form');
const goalError = document.getElementById('goal-form-error');
let goalTargetId = null;

function openGoalModal(goal) {
  goalTargetId = goal.id;
  document.getElementById('goal-id').value = goal.id;
  document.getElementById('goal-modal-text').textContent =
    goal.name + ': ' + goal.saved.toLocaleString('id-ID') + ' saved of ' +
    goal.target.toLocaleString('id-ID') + ' target. The deposit comes out of the everyday balance.';
  document.getElementById('goal-amount').value = '';
  goalError.hidden = true;
  goalBackdrop.hidden = false;
  document.getElementById('goal-amount').focus();
}

function closeGoalModal() {
  goalBackdrop.hidden = true;
  goalTargetId = null;
}

document.getElementById('goal-cancel').addEventListener('click', closeGoalModal);
goalBackdrop.addEventListener('click', (event) => {
  if (event.target === goalBackdrop) closeGoalModal();
});

goalForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const amount = Number(document.getElementById('goal-amount').value);
  const goal = state.goals.find((g) => g.id === goalTargetId);
  if (!goal) return;
  if (!Number.isFinite(amount) || amount <= 0) {
    goalError.textContent = 'Enter an amount above Rp 0.';
    goalError.hidden = false;
    return;
  }
  if (goal.saved + amount > goal.target) {
    goalError.textContent = 'That would pass the target — the most you can add is Rp ' +
      (goal.target - goal.saved).toLocaleString('id-ID') + '.';
    goalError.hidden = false;
    return;
  }
  goal.saved += Math.round(amount);
  state.transactions.push({
    id: 'u' + (state.nextId++),
    date: todayISO(),
    type: 'expense',
    category: 'other',
    amount: Math.round(amount),
    note: 'Deposit to savings goal: ' + goal.name,
    account: 'BCA — Everyday',
  });
  closeGoalModal();
  rerender();
});

/* ---- per-page bindings (delegated, so re-renders keep working) ---- */

function bindPage(route) {
  if (route === 'transactions') {
    const query = document.getElementById('filter-query');
    const type = document.getElementById('filter-type');
    const category = document.getElementById('filter-category');
    if (query) query.addEventListener('input', () => { filters.query = query.value; render(); document.getElementById('filter-query').focus(); });
    if (type) type.addEventListener('change', () => { filters.type = type.value; rerender(); });
    if (category) category.addEventListener('change', () => { filters.category = category.value; rerender(); });
    const reset = document.getElementById('filter-reset');
    if (reset) reset.addEventListener('click', () => {
      filters.query = ''; filters.type = 'all'; filters.category = 'all'; rerender();
    });
  }

  if (route === 'budgets') {
    view.querySelectorAll('[data-edit-budget]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const editor = view.querySelector('[data-budget-editor="' + btn.dataset.editBudget + '"]');
        if (editor) { editor.hidden = !editor.hidden; }
      });
    });
    view.querySelectorAll('[data-save-budget]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = document.getElementById('budget-' + btn.dataset.saveBudget);
        const value = Number(input.value);
        if (Number.isFinite(value) && value >= 0) {
          state.budgets[btn.dataset.saveBudget] = Math.round(value);
          rerender();
        } else {
          input.focus();
        }
      });
    });
  }

  if (route === 'goals') {
    view.querySelectorAll('[data-add-goal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const goal = state.goals.find((g) => g.id === btn.dataset.addGoal);
        if (goal) openGoalModal(goal);
      });
    });
    view.querySelectorAll('[data-goal-history]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const note = view.querySelector('[data-goal-why="' + btn.dataset.goalHistory + '"]');
        if (note) {
          note.hidden = !note.hidden;
          btn.textContent = note.hidden ? 'Why this goal' : 'Hide the story';
        }
      });
    });
    const newGoalForm = document.getElementById('new-goal-form');
    if (newGoalForm) {
      newGoalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('new-goal-name').value.trim();
        const target = Number(document.getElementById('new-goal-target').value);
        const first = Number(document.getElementById('new-goal-first').value) || 0;
        const error = document.getElementById('new-goal-error');
        if (!name) { error.textContent = 'Give the goal a name.'; error.hidden = false; return; }
        if (!Number.isFinite(target) || target <= 0) { error.textContent = 'Enter a target above Rp 0.'; error.hidden = false; return; }
        if (first < 0 || first > target) { error.textContent = 'The first deposit must be between Rp 0 and the target.'; error.hidden = false; return; }
        state.goals.push({
          id: 'g' + (state.nextId++),
          name,
          target: Math.round(target),
          saved: Math.round(first),
          note: 'Started ' + todayISO() + ' by the household.',
        });
        if (first > 0) {
          state.transactions.push({
            id: 'u' + (state.nextId++),
            date: todayISO(),
            type: 'expense',
            category: 'other',
            amount: Math.round(first),
            note: 'First deposit to savings goal: ' + name,
            account: 'BCA — Everyday',
          });
        }
        rerender();
      });
    }
  }
}

/* ---- global delegated actions: edit/delete transaction, pay bill ---- */

view.addEventListener('click', (event) => {
  const editBtn = event.target.closest('[data-edit-tx]');
  if (editBtn) {
    const tx = state.transactions.find((t) => t.id === editBtn.dataset.editTx);
    if (tx) openTransactionModal(tx);
    return;
  }
  const deleteBtn = event.target.closest('[data-delete-tx]');
  if (deleteBtn) {
    const tx = state.transactions.find((t) => t.id === deleteBtn.dataset.deleteTx);
    if (tx && window.confirm('Delete this transaction?\n' + tx.note + ' — ' + tx.amount.toLocaleString('id-ID') + ' rupiah.')) {
      state.transactions = state.transactions.filter((t) => t.id !== tx.id);
      rerender();
    }
    return;
  }
  const payBtn = event.target.closest('[data-pay-bill]');
  if (payBtn) {
    const bill = state.bills.find((b) => b.id === payBtn.dataset.payBill);
    if (!bill || bill.paid) return;
    bill.paid = true;
    state.transactions.push({
      id: 'u' + (state.nextId++),
      date: todayISO(),
      type: 'expense',
      category: bill.name.toLowerCase().includes('pln') || bill.name.toLowerCase().includes('pdam') || bill.name.toLowerCase().includes('internet') ? 'utilities' : 'other',
      amount: bill.amount,
      note: 'Bill paid: ' + bill.name,
      account: 'BCA — Everyday',
    });
    rerender();
  }
});

/* ---- footer: reset the demo data ---- */

const resetLink = document.createElement('p');
resetLink.innerHTML = '<button type="button" class="link-btn" id="reset-data">Reset the ledger to its November starting figures</button>';
document.querySelector('.footer').appendChild(resetLink);
document.getElementById('reset-data').addEventListener('click', () => {
  if (window.confirm('Reset all changes and restore the original November 2026 figures?')) {
    state = resetState();
    filters.query = ''; filters.type = 'all'; filters.category = 'all';
    rerender();
  }
});

window.addEventListener('hashchange', render);
render();
