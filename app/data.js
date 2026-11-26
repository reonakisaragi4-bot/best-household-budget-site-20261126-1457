/* HearthLedger data: the Wijaya household's seeded November 2026 ledger, plus
   load/save to localStorage and the totals the views need. All figures are in
   Indonesian rupiah. Nothing here touches the network. */

import { monthKeyOf } from './format.js';

export const HOUSEHOLD = {
  name: 'Keluarga Wijaya',
  members: ['Ayu (salary)', 'Budi (freelance)', 'Nara (school)', 'Dimas (school)'],
  month: '2026-11',
  openingBalance: 24500000,
};

export const CATEGORIES = [
  { id: 'groceries', name: 'Groceries', colour: '#2e7d4f', budget: 3200000, icon: '🛒' },
  { id: 'housing', name: 'Housing & Rent', colour: '#5b4a8a', budget: 3500000, icon: '🏠' },
  { id: 'utilities', name: 'Utilities', colour: '#b7791f', budget: 1300000, icon: '💡' },
  { id: 'transport', name: 'Transport', colour: '#2f6fb3', budget: 900000, icon: '🚌' },
  { id: 'dining', name: 'Dining Out', colour: '#c94f6d', budget: 1200000, icon: '🍜' },
  { id: 'education', name: 'Education', colour: '#0f766e', budget: 1800000, icon: '📚' },
  { id: 'health', name: 'Health', colour: '#7c3f98', budget: 700000, icon: '💊' },
  { id: 'entertainment', name: 'Entertainment', colour: '#d97b29', budget: 600000, icon: '🎬' },
  { id: 'clothing', name: 'Clothing', colour: '#64748b', budget: 500000, icon: '👕' },
  { id: 'household', name: 'Household Items', colour: '#8a6d3b', budget: 600000, icon: '🧺' },
  { id: 'income', name: 'Income', colour: '#1e5c46', budget: 0, icon: '💰' },
  { id: 'other', name: 'Other', colour: '#94a3b8', budget: 400000, icon: '⋯' },
];

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
}

const SEED_TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', type: 'income', category: 'income', amount: 18500000, note: 'Ayu — monthly salary', account: 'BCA — Everyday' },
  { id: 't02', date: '2026-11-01', type: 'expense', category: 'housing', amount: 3500000, note: 'Monthly house rent', account: 'BCA — Everyday' },
  { id: 't03', date: '2026-11-02', type: 'expense', category: 'groceries', amount: 842000, note: 'Super Indo — weekly shop', account: 'BCA — Everyday' },
  { id: 't04', date: '2026-11-03', type: 'expense', category: 'education', amount: 1250000, note: 'Nara & Dimas school fees', account: 'BCA — Everyday' },
  { id: 't05', date: '2026-11-04', type: 'expense', category: 'utilities', amount: 612000, note: 'PLN electricity bill', account: 'BCA — Everyday' },
  { id: 't06', date: '2026-11-05', type: 'expense', category: 'transport', amount: 300000, note: 'Pertalite fuel', account: 'Cash wallet' },
  { id: 't07', date: '2026-11-06', type: 'expense', category: 'dining', amount: 186000, note: 'Warung dinner with family', account: 'GoPay' },
  { id: 't08', date: '2026-11-07', type: 'expense', category: 'groceries', amount: 423500, note: 'Pasar Minggu — vegetables & fish', account: 'Cash wallet' },
  { id: 't09', date: '2026-11-08', type: 'expense', category: 'entertainment', amount: 149000, note: 'Streaming subscription', account: 'BCA — Everyday' },
  { id: 't10', date: '2026-11-09', type: 'expense', category: 'health', amount: 275000, note: 'Pharmacy — vitamins & medicine', account: 'BCA — Everyday' },
  { id: 't11', date: '2026-11-10', type: 'expense', category: 'utilities', amount: 349000, note: 'Internet — IndiHome', account: 'BCA — Everyday' },
  { id: 't12', date: '2026-11-11', type: 'expense', category: 'transport', amount: 142000, note: 'Gojek rides this week', account: 'GoPay' },
  { id: 't13', date: '2026-11-12', type: 'income', category: 'income', amount: 2400000, note: 'Budi — freelance design invoice', account: 'BCA — Everyday' },
  { id: 't14', date: '2026-11-12', type: 'expense', category: 'groceries', amount: 685000, note: 'Super Indo — weekly shop', account: 'BCA — Everyday' },
  { id: 't15', date: '2026-11-13', type: 'expense', category: 'household', amount: 214000, note: 'Cleaning supplies & detergent', account: 'Cash wallet' },
  { id: 't16', date: '2026-11-14', type: 'expense', category: 'dining', amount: 324000, note: 'Birthday lunch at Sate Khas', account: 'BCA — Everyday' },
  { id: 't17', date: '2026-11-15', type: 'expense', category: 'education', amount: 350000, note: 'Nara — maths tutoring', account: 'BCA — Everyday' },
  { id: 't18', date: '2026-11-16', type: 'expense', category: 'clothing', amount: 459000, note: 'School uniforms for Dimas', account: 'BCA — Everyday' },
  { id: 't19', date: '2026-11-17', type: 'expense', category: 'groceries', amount: 512000, note: 'Pasar & minimarket top-up', account: 'Cash wallet' },
  { id: 't20', date: '2026-11-18', type: 'expense', category: 'health', amount: 180000, note: 'Dentist check-up — Dimas', account: 'BCA — Everyday' },
  { id: 't21', date: '2026-11-19', type: 'expense', category: 'transport', amount: 95000, note: 'Parking & tolls', account: 'Cash wallet' },
  { id: 't22', date: '2026-11-20', type: 'expense', category: 'dining', amount: 128000, note: 'Coffee & snacks — Ayu & Budi', account: 'GoPay' },
  { id: 't23', date: '2026-11-21', type: 'expense', category: 'entertainment', amount: 210000, note: 'Cinema — family movie night', account: 'BCA — Everyday' },
  { id: 't24', date: '2026-11-22', type: 'expense', category: 'groceries', amount: 738000, note: 'Super Indo — weekly shop', account: 'BCA — Everyday' },
  { id: 't25', date: '2026-11-23', type: 'expense', category: 'utilities', amount: 185000, note: 'PDAM water bill', account: 'BCA — Everyday' },
  { id: 't26', date: '2026-11-24', type: 'expense', category: 'other', amount: 120000, note: 'Gift for neighbour’s wedding', account: 'Cash wallet' },
  { id: 't27', date: '2026-11-25', type: 'income', category: 'income', amount: 86250, note: 'BCA savings interest', account: 'BCA — Savings' },
  { id: 't28', date: '2026-11-25', type: 'expense', category: 'transport', amount: 168000, note: 'Gojek rides this week', account: 'GoPay' },
  { id: 't29', date: '2026-11-26', type: 'expense', category: 'groceries', amount: 296000, note: 'Fruit & bread — morning market', account: 'Cash wallet' },
];

export const SEED_GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 30000000, saved: 18750000, note: 'Six months of essentials, kept in BCA Savings.' },
  { id: 'g2', name: 'Family trip to Yogyakarta', target: 8000000, saved: 5200000, note: 'Train tickets, two nights, Borobudur sunrise.' },
  { id: 'g3', name: 'New washing machine', target: 4500000, saved: 4500000, note: 'Bought 18 Nov — goal complete!' },
];

export const SEED_BILLS = [
  { id: 'b1', name: 'PLN electricity', amount: 640000, due: '2026-12-05', paid: false },
  { id: 'b2', name: 'Internet — IndiHome', amount: 349000, due: '2026-12-10', paid: false },
  { id: 'b3', name: 'PDAM water', amount: 190000, due: '2026-12-12', paid: false },
  { id: 'b4', name: 'Nara — English course', amount: 450000, due: '2026-12-15', paid: false },
  { id: 'b5', name: 'BPJS Kesehatan', amount: 210000, due: '2026-12-20', paid: false },
];

/* Monthly totals for the reports chart: July–November 2026. */
export const MONTHLY_HISTORY = [
  { month: '2026-07', income: 20400000, expenses: 13120000 },
  { month: '2026-08', income: 19850000, expenses: 14280000 },
  { month: '2026-09', income: 21200000, expenses: 12890000 },
  { month: '2026-10', income: 20986250, expenses: 13540000 },
  { month: '2026-11', income: 20986250, expenses: 0 }, // November expenses filled in live
];

const STORAGE_KEY = 'hearthledger-v1';

function seedState() {
  return {
    transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
    budgets: Object.fromEntries(CATEGORIES.filter((c) => c.budget > 0).map((c) => [c.id, c.budget])),
    goals: SEED_GOALS.map((g) => ({ ...g })),
    bills: SEED_BILLS.map((b) => ({ ...b })),
    nextId: 100,
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.goals)) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Storage unavailable (private mode, hosting sandbox): the session keeps
       working in memory and the site still does everything it says. */
  }
}

export function resetState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  return seedState();
}

export function monthTransactions(state, month) {
  return state.transactions.filter((t) => monthKeyOf(t.date) === month);
}

export function monthTotals(state, month) {
  let income = 0;
  let expenses = 0;
  for (const t of monthTransactions(state, month)) {
    if (t.type === 'income') income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, balance: income - expenses };
}

export function spentByCategory(state, month) {
  const spent = {};
  for (const t of monthTransactions(state, month)) {
    if (t.type !== 'expense') continue;
    spent[t.category] = (spent[t.category] || 0) + t.amount;
  }
  return spent;
}

export function totalBudget(state) {
  return Object.values(state.budgets).reduce((sum, b) => sum + b, 0);
}

export function historyWithCurrent(state) {
  return MONTHLY_HISTORY.map((row) => {
    if (row.month === HOUSEHOLD.month) {
      return { ...row, expenses: monthTotals(state, row.month).expenses };
    }
    return row;
  });
}
