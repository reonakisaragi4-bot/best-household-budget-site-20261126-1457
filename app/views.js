/* HearthLedger views: one render function per page, each returning HTML, plus a
   mount step that draws the page's charts after the HTML is in the document. */

import { formatIDR, formatDate, monthLabel, clamp } from './format.js';
import {
  HOUSEHOLD, CATEGORIES, categoryById, monthTransactions, monthTotals,
  spentByCategory, totalBudget, historyWithCurrent,
} from './data.js';
import { drawDonut, drawMonthlyBars, drawBarsLegend } from './charts.js';

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function transactionRow(t) {
  const cat = categoryById(t.category);
  const signed = t.type === 'income'
    ? '<span class="amount-in">+ ' + formatIDR(t.amount) + '</span>'
    : '<span class="amount-out">− ' + formatIDR(t.amount) + '</span>';
  return '<tr>' +
    '<td>' + formatDate(t.date) + '</td>' +
    '<td><span class="cat-dot" style="background:' + cat.colour + '"></span>' + escapeHtml(cat.name) + '</td>' +
    '<td>' + escapeHtml(t.note) + '</td>' +
    '<td class="hide-phone">' + escapeHtml(t.account) + '</td>' +
    '<td class="num">' + signed + '</td>' +
    '<td class="row-actions">' +
      '<button type="button" class="link-btn" data-edit-tx="' + t.id + '">Edit</button>' +
      '<button type="button" class="link-btn danger" data-delete-tx="' + t.id + '">Delete</button>' +
    '</td></tr>';
}

export function renderOverview(state) {
  const month = HOUSEHOLD.month;
  const totals = monthTotals(state, month);
  const spent = spentByCategory(state, month);
  const budgetTotal = totalBudget(state);
  const remaining = budgetTotal - totals.expenses;
  const balance = HOUSEHOLD.openingBalance + totals.balance;
  const daysLeft = 30 - 26; // 26 November: 4 days left in the month
  const dailyBudget = remaining > 0 ? Math.floor(remaining / daysLeft) : 0;

  const slices = CATEGORIES
    .filter((c) => c.id !== 'income' && (spent[c.id] || 0) > 0)
    .map((c) => ({ label: c.name, value: spent[c.id], colour: c.colour }))
    .sort((a, b) => b.value - a.value);
  const topSlices = slices.slice(0, 6);
  const otherTotal = slices.slice(6).reduce((sum, s) => sum + s.value, 0);
  if (otherTotal > 0) topSlices.push({ label: 'Other', value: otherTotal, colour: '#94a3b8' });

  const recent = [...monthTransactions(state, month)]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 7);
  const unpaid = state.bills.filter((b) => !b.paid);
  const goals = state.goals;
  const goalProgress = goals.map((g) => Math.round((g.saved / g.target) * 100));

  return '' +
  '<div class="page-head"><h1>November budget at a glance</h1>' +
  '<p>' + escapeHtml(HOUSEHOLD.name) + ' — ' + escapeHtml(HOUSEHOLD.members.join(', ')) +
  '. Four days left in November; every figure below is live from the ledger.</p></div>' +

  '<div class="grid grid-3">' +
    '<div class="card stat"><div class="label">Balance now</div>' +
      '<div class="value">' + formatIDR(balance) + '</div>' +
      '<div class="sub">Opening ' + formatIDR(HOUSEHOLD.openingBalance) + ' + this month’s net</div></div>' +
    '<div class="card stat"><div class="label">Income in November</div>' +
      '<div class="value value-income">' + formatIDR(totals.income) + '</div>' +
      '<div class="sub">Salary, freelance and interest</div></div>' +
    '<div class="card stat"><div class="label">Spent in November</div>' +
      '<div class="value value-expense">' + formatIDR(totals.expenses) + '</div>' +
      '<div class="sub">of a ' + formatIDR(budgetTotal) + ' monthly budget</div></div>' +
  '</div>' +

  '<div class="grid grid-main" style="margin-top:16px">' +
    '<div class="card"><h2>Where the money went</h2>' +
      '<p class="hint">Spending by category, November 2026.</p>' +
      '<div class="chart-wrap"><canvas id="donut" width="220" height="220" role="img" aria-label="Donut chart of spending by category"></canvas>' +
      '<ul class="legend">' +
        topSlices.map((s) => '<li><span><span class="cat-dot" style="background:' + s.colour + '"></span>' +
          escapeHtml(s.label) + '</span><span class="legend-amount">' + formatIDR(s.value) + '</span></li>').join('') +
      '</ul></div>' +
      '<p class="summary-line" style="margin-top:12px">' +
        (remaining >= 0
          ? '<b class="value-good">' + formatIDR(remaining) + ' left</b> of the monthly budget — about <b>' + formatIDR(dailyBudget) + ' a day</b> for the last ' + daysLeft + ' days.'
          : '<b class="value-bad">' + formatIDR(-remaining) + ' over budget</b> — spending has passed the monthly plan.') +
      '</p></div>' +

    '<div class="card"><h2>Upcoming bills</h2>' +
      '<p class="hint">' + unpaid.length + ' bills still to pay in December.</p>' +
      unpaid.map((b) => '<div class="bill"><div><div class="bill-name">' + escapeHtml(b.name) + '</div>' +
        '<div class="bill-due">Due ' + formatDate(b.due) + '</div></div>' +
        '<span class="bill-amount">' + formatIDR(b.amount) + '</span>' +
        '<button type="button" class="btn btn-small" data-pay-bill="' + b.id + '">Pay now</button></div>').join('') +
      '<p class="hint" style="margin-top:10px">Paying a bill adds it to Transactions as an expense on today’s date.</p></div>' +
  '</div>' +

  '<div class="grid grid-main" style="margin-top:16px">' +
    '<div class="card"><h2>Recent transactions</h2>' +
      '<div style="overflow-x:auto"><table><thead><tr><th>Date</th><th>Category</th><th>Note</th><th class="hide-phone">Account</th><th class="num">Amount</th><th></th></tr></thead><tbody>' +
      recent.map(transactionRow).join('') +
      '</tbody></table></div>' +
      '<p style="margin:12px 0 0"><a href="#/transactions">See all ' + monthTransactions(state, month).length + ' November transactions →</a></p></div>' +

    '<div class="card"><h2>Savings goals</h2>' +
      goals.map((g, i) => '<div class="budget-row"><div class="budget-top"><span class="name">' + escapeHtml(g.name) + '</span>' +
        '<span class="figures"><b>' + formatIDR(g.saved) + '</b> / ' + formatIDR(g.target) + '</span></div>' +
        '<div class="bar" style="margin-top:8px"><span style="width:' + clamp(goalProgress[i], 0, 100) + '%"></span></div>' +
        '<div class="budget-meta"><span>' + goalProgress[i] + '% funded</span>' +
        (g.saved >= g.target ? '<span class="done">Complete ✓</span>' : '<span>' + formatIDR(g.target - g.saved) + ' to go</span>') +
        '</div></div>').join('') +
      '<p style="margin:12px 0 0"><a href="#/goals">Manage goals →</a></p></div>' +
  '</div>';
}

export function renderTransactions(state, filters) {
  const month = HOUSEHOLD.month;
  let rows = monthTransactions(state, month);
  if (filters.type !== 'all') rows = rows.filter((t) => t.type === filters.type);
  if (filters.category !== 'all') rows = rows.filter((t) => t.category === filters.category);
  if (filters.query) {
    const q = filters.query.toLowerCase();
    rows = rows.filter((t) => t.note.toLowerCase().includes(q) || categoryById(t.category).name.toLowerCase().includes(q));
  }
  rows = [...rows].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const inTotal = rows.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const outTotal = rows.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const categoryOptions = '<option value="all">All categories</option>' +
    CATEGORIES.map((c) => '<option value="' + c.id + '"' + (filters.category === c.id ? ' selected' : '') + '>' + escapeHtml(c.name) + '</option>').join('');

  return '' +
  '<div class="page-head"><h1>Transactions — ' + monthLabel(month) + '</h1>' +
  '<p>Every rupiah in and out this month. Add one, fix a note, or delete a mistake — the totals below update at once.</p></div>' +

  '<div class="card"><div class="filters">' +
    '<div class="field"><label for="filter-query">Search</label>' +
      '<input id="filter-query" type="search" placeholder="e.g. Super Indo" value="' + escapeHtml(filters.query) + '"></div>' +
    '<div class="field field-narrow"><label for="filter-type">Type</label>' +
      '<select id="filter-type"><option value="all">All</option>' +
      '<option value="income"' + (filters.type === 'income' ? ' selected' : '') + '>Income</option>' +
      '<option value="expense"' + (filters.type === 'expense' ? ' selected' : '') + '>Expenses</option></select></div>' +
    '<div class="field"><label for="filter-category">Category</label><select id="filter-category">' + categoryOptions + '</select></div>' +
    '<button type="button" class="btn" id="filter-reset">Reset filters</button>' +
  '</div>' +
  '<div class="totals-row" style="margin-bottom:12px">' +
    '<span>Showing <b>' + rows.length + '</b> transactions</span>' +
    '<span>Income <b class="value-income">' + formatIDR(inTotal) + '</b></span>' +
    '<span>Expenses <b class="value-expense">' + formatIDR(outTotal) + '</b></span>' +
    '<span>Net <b>' + formatIDR(inTotal - outTotal) + '</b></span>' +
  '</div>' +
  (rows.length === 0
    ? '<p class="empty">No transactions match these filters. Try clearing the search or picking another category.</p>'
    : '<div style="overflow-x:auto"><table><thead><tr><th>Date</th><th>Category</th><th>Note</th><th class="hide-phone">Account</th><th class="num">Amount</th><th></th></tr></thead><tbody>' +
      rows.map(transactionRow).join('') + '</tbody></table></div>') +
  '</div>';
}

export function renderBudgets(state) {
  const month = HOUSEHOLD.month;
  const spent = spentByCategory(state, month);
  const budgetTotal = totalBudget(state);
  const totals = monthTotals(state, month);
  const rows = CATEGORIES.filter((c) => c.budget > 0 || (spent[c.id] || 0) > 0).map((c) => {
    const limit = state.budgets[c.id] || 0;
    const used = spent[c.id] || 0;
    const pct = limit > 0 ? Math.round((used / limit) * 100) : 0;
    const status = limit > 0 && used > limit
      ? '<span class="over">' + formatIDR(used - limit) + ' over budget</span>'
      : '<span class="left">' + formatIDR(Math.max(limit - used, 0)) + ' left</span>';
    const barClass = used > limit ? 'bar over' : pct >= 85 ? 'bar warn' : 'bar';
    return '<div class="budget-row">' +
      '<div class="budget-top"><span class="name"><span class="cat-dot" style="background:' + c.colour + '"></span>' + escapeHtml(c.name) + '</span>' +
      '<span class="figures"><b>' + formatIDR(used) + '</b> of ' + formatIDR(limit) + ' (' + pct + '%)</span></div>' +
      '<div class="' + barClass + '" style="margin-top:8px"><span style="width:' + clamp(pct, 0, 100) + '%"></span></div>' +
      '<div class="budget-meta"><span>' + status + '</span>' +
      '<span><button type="button" class="link-btn" data-edit-budget="' + c.id + '">Change budget</button></span></div>' +
      '<div class="budget-edit" data-budget-editor="' + c.id + '" hidden>' +
        '<label for="budget-' + c.id + '" style="margin:0">Monthly budget (Rp)</label>' +
        '<input id="budget-' + c.id + '" type="number" min="0" step="10000" value="' + limit + '">' +
        '<button type="button" class="btn btn-small btn-primary" data-save-budget="' + c.id + '">Save</button>' +
      '</div></div>';
  }).join('');

  return '' +
  '<div class="page-head"><h1>Monthly budgets — ' + monthLabel(month) + '</h1>' +
  '<p>One limit per category. The bars fill as spending lands; change any limit and the overview updates with it.</p></div>' +
  '<div class="card"><div class="totals-row" style="margin-bottom:8px">' +
    '<span>Total budget <b>' + formatIDR(budgetTotal) + '</b></span>' +
    '<span>Spent so far <b class="value-expense">' + formatIDR(totals.expenses) + '</b></span>' +
    '<span>' + (budgetTotal - totals.expenses >= 0
      ? 'Remaining <b class="value-good">' + formatIDR(budgetTotal - totals.expenses) + '</b>'
      : 'Over by <b class="value-bad">' + formatIDR(totals.expenses - budgetTotal) + '</b>') + '</span>' +
  '</div>' + rows + '</div>';
}

export function renderGoals(state) {
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const cards = state.goals.map((g) => {
    const pct = Math.round((g.saved / g.target) * 100);
    const complete = g.saved >= g.target;
    return '<div class="card goal-card"><div class="goal-top"><h3>' + escapeHtml(g.name) + '</h3>' +
      '<span class="goal-target">Target ' + formatIDR(g.target) + '</span></div>' +
      '<div class="goal-amount">' + formatIDR(g.saved) + '</div>' +
      '<p class="goal-note">' + escapeHtml(g.note) + '</p>' +
      '<div class="bar' + (complete ? '' : '') + '"><span style="width:' + clamp(pct, 0, 100) + '%"></span></div>' +
      '<div class="budget-meta"><span>' + pct + '% funded</span>' +
      (complete ? '<span class="done">Complete ✓</span>' : '<span>' + formatIDR(g.target - g.saved) + ' to go</span>') + '</div>' +
      '<div class="goal-actions">' +
        (complete ? '' : '<button type="button" class="btn btn-small btn-primary" data-add-goal="' + g.id + '">Add money</button>') +
        '<button type="button" class="btn btn-small" data-goal-history="' + g.id + '">Why this goal</button>' +
      '</div>' +
      '<p class="hint" data-goal-why="' + g.id + '" hidden style="margin-top:10px">' + escapeHtml(goalWhy(g.id)) + '</p></div>';
  }).join('');

  return '' +
  '<div class="page-head"><h1>Savings goals</h1>' +
  '<p>' + formatIDR(totalSaved) + ' saved across ' + state.goals.length + ' goals, of ' + formatIDR(totalTarget) + ' targeted. Add money to a goal and it moves straight out of the everyday balance.</p></div>' +
  '<div class="grid grid-3">' + cards + '</div>' +
  '<div class="card" style="margin-top:16px"><h2>New goal</h2>' +
    '<p class="hint">Start saving for something else — a name, a target and a first deposit.</p>' +
    '<form id="new-goal-form"><div class="filters" style="margin-bottom:0">' +
    '<div class="field"><label for="new-goal-name">Goal name</label><input id="new-goal-name" type="text" maxlength="60" placeholder="e.g. New motorbike" required></div>' +
    '<div class="field field-narrow"><label for="new-goal-target">Target (Rp)</label><input id="new-goal-target" type="number" min="10000" step="10000" placeholder="5000000" required></div>' +
    '<div class="field field-narrow"><label for="new-goal-first">First deposit (Rp)</label><input id="new-goal-first" type="number" min="0" step="10000" value="0"></div>' +
    '<button type="submit" class="btn btn-primary">Create goal</button>' +
    '</div><p id="new-goal-error" class="form-error" role="alert" hidden></p></form></div>';
}

function goalWhy(id) {
  if (id === 'g1') return 'Why: if Ayu’s salary ever stops for a month, the household still eats, pays rent and keeps the lights on. Six months of essentials is the target the family agreed on in January.';
  if (id === 'g2') return 'Why: Nara and Dimas have never seen Borobudur. The train from Jakarta, two nights in a guesthouse and the sunrise ticket — booked once the fund reaches Rp 8.000.000.';
  if (id === 'g3') return 'Why: the old machine died in October. This goal was funded from the October surplus and the machine was bought on 18 November.';
  return 'Why: a goal the household set for itself — every deposit is a step toward it.';
}

export function renderReports(state) {
  const month = HOUSEHOLD.month;
  const history = historyWithCurrent(state);
  const totals = monthTotals(state, month);
  const spent = spentByCategory(state, month);
  const daysSoFar = 26;
  const avgDaily = Math.round(totals.expenses / daysSoFar);
  const biggest = [...monthTransactions(state, month)]
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  const topCategory = Object.entries(spent).sort((a, b) => b[1] - a[1])[0];
  const breakdown = Object.entries(spent)
    .sort((a, b) => b[1] - a[1])
    .map(([id, value]) => {
      const c = categoryById(id);
      const pct = Math.round((value / totals.expenses) * 100);
      return '<tr><td><span class="cat-dot" style="background:' + c.colour + '"></span>' + escapeHtml(c.name) + '</td>' +
        '<td class="num">' + formatIDR(value) + '</td><td class="num">' + pct + '%</td></tr>';
    }).join('');

  return '' +
  '<div class="page-head"><h1>Reports — five months of the household</h1>' +
  '<p>Income against expenses, July to November 2026, and where November’s spending actually went.</p></div>' +

  '<div class="grid grid-3">' +
    '<div class="card stat"><div class="label">Average daily spend</div>' +
      '<div class="value">' + formatIDR(avgDaily) + '</div><div class="sub">November, over ' + daysSoFar + ' days</div></div>' +
    '<div class="card stat"><div class="label">Biggest category</div>' +
      '<div class="value" style="font-size:22px">' + escapeHtml(categoryById(topCategory[0]).name) + '</div>' +
      '<div class="sub">' + formatIDR(topCategory[1]) + ' — ' + Math.round((topCategory[1] / totals.expenses) * 100) + '% of spending</div></div>' +
    '<div class="card stat"><div class="label">Best saving month</div>' +
      '<div class="value" style="font-size:22px">September</div>' +
      '<div class="sub">Rp 8.310.000 saved (income minus expenses)</div></div>' +
  '</div>' +

  '<div class="grid grid-main" style="margin-top:16px">' +
    '<div class="card"><h2>Income vs expenses by month</h2>' +
      '<p class="hint">' + drawBarsLegend() + '</p>' +
      '<canvas id="monthly-bars" width="640" height="280" role="img" aria-label="Bar chart of income and expenses by month"></canvas>' +
      '<p class="hint">November’s expenses are live from the ledger; earlier months are the closed books.</p></div>' +
    '<div class="card"><h2>November spending breakdown</h2>' +
      '<table><thead><tr><th>Category</th><th class="num">Spent</th><th class="num">Share</th></tr></thead><tbody>' + breakdown + '</tbody></table></div>' +
  '</div>' +

  '<div class="card" style="margin-top:16px"><h2>Biggest single expenses in November</h2>' +
    '<table><thead><tr><th>Date</th><th>Category</th><th>Note</th><th class="num">Amount</th></tr></thead><tbody>' +
    biggest.map((t) => '<tr><td>' + formatDate(t.date) + '</td><td>' + escapeHtml(categoryById(t.category).name) + '</td><td>' + escapeHtml(t.note) + '</td><td class="num amount-out">− ' + formatIDR(t.amount) + '</td></tr>').join('') +
    '</tbody></table>' +
    '<p class="hint" style="margin-top:10px">Rent is the household’s largest fixed cost; groceries are the largest cost the family can still steer day to day.</p></div>';
}

export function mountCharts(state, route) {
  if (route === 'overview') {
    const canvas = document.getElementById('donut');
    if (canvas) {
      const spent = spentByCategory(state, HOUSEHOLD.month);
      const slices = CATEGORIES
        .filter((c) => c.id !== 'income' && (spent[c.id] || 0) > 0)
        .map((c) => ({ label: c.name, value: spent[c.id], colour: c.colour }))
        .sort((a, b) => b.value - a.value);
      const top = slices.slice(0, 6);
      const rest = slices.slice(6).reduce((s, x) => s + x.value, 0);
      if (rest > 0) top.push({ label: 'Other', value: rest, colour: '#94a3b8' });
      drawDonut(canvas, top);
    }
  }
  if (route === 'reports') {
    const canvas = document.getElementById('monthly-bars');
    if (canvas) drawMonthlyBars(canvas, historyWithCurrent(state));
  }
}
