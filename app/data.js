// HearthLedger seed data — the Wijaya household's November 2026 books.
// Everything here is the starting ledger. The live site copies this into
// localStorage on first visit and then edits its own copy; this file never
// changes after load, so "reset" just means "load the seed again".

export const HOUSEHOLD = {
  name: "Keluarga Wijaya",
  month: "November 2026",
  members: "Ayu (salary), Budi (freelance), Nara (school), Dimas (school)",
  openingBalance: 24500000,
  monthDays: 30,
  // The site is used on 26 November, so four days of the month remain.
  dayToday: 26,
};

export const ACCOUNTS = [
  "BCA — Everyday",
  "BCA — Savings",
  "Cash wallet",
  "GoPay",
];

// One entry per spending category. `limit` is the November ceiling in rupiah.
// "Income" is a category too, so income rows can sit in the same table.
export const CATEGORIES = [
  { id: "groceries", label: "Groceries", color: "#2e7d32", limit: 3200000 },
  { id: "housing", label: "Housing & Rent", color: "#6a4fa3", limit: 3500000 },
  { id: "utilities", label: "Utilities", color: "#b45309", limit: 1300000 },
  { id: "transport", label: "Transport", color: "#2563eb", limit: 900000 },
  { id: "dining", label: "Dining Out", color: "#db2777", limit: 1200000 },
  { id: "education", label: "Education", color: "#0891b2", limit: 1800000 },
  { id: "health", label: "Health", color: "#b91c1c", limit: 700000 },
  { id: "entertainment", label: "Entertainment", color: "#ea580c", limit: 600000 },
  { id: "clothing", label: "Clothing", color: "#8b5cf6", limit: 500000 },
  { id: "household", label: "Household Items", color: "#64748b", limit: 600000 },
  { id: "other", label: "Other", color: "#94a3b8", limit: 400000 },
  { id: "income", label: "Income", color: "#166534", limit: 0 },
];

export function categoryById(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 2];
}

// The 29 rows of November, newest first. `kind` is "in" or "out".
// Amounts are always positive; the kind decides the sign.
export const SEED_TRANSACTIONS = [
  { id: "t01", date: "2026-11-26", cat: "groceries", note: "Fruit & bread — morning market", account: "Cash wallet", amount: 296000, kind: "out" },
  { id: "t02", date: "2026-11-25", cat: "income", note: "BCA savings interest", account: "BCA — Savings", amount: 86250, kind: "in" },
  { id: "t03", date: "2026-11-25", cat: "transport", note: "Gojek rides this week", account: "GoPay", amount: 168000, kind: "out" },
  { id: "t04", date: "2026-11-24", cat: "other", note: "Gift for neighbour's wedding", account: "Cash wallet", amount: 120000, kind: "out" },
  { id: "t05", date: "2026-11-23", cat: "utilities", note: "PDAM water bill", account: "BCA — Everyday", amount: 185000, kind: "out" },
  { id: "t06", date: "2026-11-22", cat: "groceries", note: "Super Indo — weekly shop", account: "BCA — Everyday", amount: 738000, kind: "out" },
  { id: "t07", date: "2026-11-21", cat: "entertainment", note: "Cinema — family movie night", account: "BCA — Everyday", amount: 210000, kind: "out" },
  { id: "t08", date: "2026-11-20", cat: "dining", note: "Coffee & snacks — Ayu & Budi", account: "GoPay", amount: 128000, kind: "out" },
  { id: "t09", date: "2026-11-19", cat: "transport", note: "Parking & tolls", account: "Cash wallet", amount: 95000, kind: "out" },
  { id: "t10", date: "2026-11-18", cat: "health", note: "Dentist check-up — Dimas", account: "BCA — Everyday", amount: 180000, kind: "out" },
  { id: "t11", date: "2026-11-17", cat: "groceries", note: "Pasar & minimarket top-up", account: "Cash wallet", amount: 512000, kind: "out" },
  { id: "t12", date: "2026-11-16", cat: "clothing", note: "School uniforms for Dimas", account: "BCA — Everyday", amount: 459000, kind: "out" },
  { id: "t13", date: "2026-11-15", cat: "education", note: "Nara — maths tutoring", account: "BCA — Everyday", amount: 350000, kind: "out" },
  { id: "t14", date: "2026-11-14", cat: "dining", note: "Birthday lunch at Sate Khas", account: "BCA — Everyday", amount: 324000, kind: "out" },
  { id: "t15", date: "2026-11-13", cat: "household", note: "Cleaning supplies & detergent", account: "Cash wallet", amount: 214000, kind: "out" },
  { id: "t16", date: "2026-11-12", cat: "income", note: "Budi — freelance design invoice", account: "BCA — Everyday", amount: 2400000, kind: "in" },
  { id: "t17", date: "2026-11-12", cat: "groceries", note: "Super Indo — weekly shop", account: "BCA — Everyday", amount: 685000, kind: "out" },
  { id: "t18", date: "2026-11-11", cat: "transport", note: "Gojek rides this week", account: "GoPay", amount: 142000, kind: "out" },
  { id: "t19", date: "2026-11-10", cat: "utilities", note: "Internet — IndiHome", account: "BCA — Everyday", amount: 349000, kind: "out" },
  { id: "t20", date: "2026-11-09", cat: "health", note: "Pharmacy — vitamins & medicine", account: "BCA — Everyday", amount: 275000, kind: "out" },
  { id: "t21", date: "2026-11-08", cat: "entertainment", note: "Streaming subscription", account: "BCA — Everyday", amount: 149000, kind: "out" },
  { id: "t22", date: "2026-11-07", cat: "groceries", note: "Pasar Minggu — vegetables & fish", account: "Cash wallet", amount: 423500, kind: "out" },
  { id: "t23", date: "2026-11-06", cat: "dining", note: "Warung dinner with family", account: "GoPay", amount: 186000, kind: "out" },
  { id: "t24", date: "2026-11-05", cat: "transport", note: "Pertalite fuel", account: "Cash wallet", amount: 300000, kind: "out" },
  { id: "t25", date: "2026-11-04", cat: "utilities", note: "PLN electricity bill", account: "BCA — Everyday", amount: 612000, kind: "out" },
  { id: "t26", date: "2026-11-03", cat: "education", note: "Nara & Dimas school fees", account: "BCA — Everyday", amount: 1250000, kind: "out" },
  { id: "t27", date: "2026-11-02", cat: "groceries", note: "Super Indo — weekly shop", account: "BCA — Everyday", amount: 842000, kind: "out" },
  { id: "t28", date: "2026-11-01", cat: "income", note: "Ayu — monthly salary", account: "BCA — Everyday", amount: 18500000, kind: "in" },
  { id: "t29", date: "2026-11-01", cat: "housing", note: "Monthly house rent", account: "BCA — Everyday", amount: 3500000, kind: "out" },
];

// Bills that fall due in December. Paying one books it as an expense dated
// today and takes it off this list.
export const SEED_BILLS = [
  { id: "b1", name: "PLN electricity", due: "2026-12-05", amount: 640000, cat: "utilities", paid: false },
  { id: "b2", name: "Internet — IndiHome", due: "2026-12-10", amount: 349000, cat: "utilities", paid: false },
  { id: "b3", name: "PDAM water", due: "2026-12-12", amount: 190000, cat: "utilities", paid: false },
  { id: "b4", name: "Nara — English course", due: "2026-12-15", amount: 450000, cat: "education", paid: false },
  { id: "b5", name: "BPJS Kesehatan", due: "2026-12-20", amount: 210000, cat: "health", paid: false },
];

// Savings goals. `blurb` is the one-line summary; `story` is the longer
// reason, shown when the family taps "Why this goal".
export const SEED_GOALS = [
  {
    id: "g1", name: "Emergency fund", target: 30000000, saved: 18750000,
    blurb: "Six months of essentials, kept in BCA Savings.",
    story: "Why: if Ayu's salary ever stops for a month, the household still eats, pays rent and keeps the lights on. Six months of essentials is the target the family agreed on in January.",
  },
  {
    id: "g2", name: "Family trip to Yogyakarta", target: 8000000, saved: 5200000,
    blurb: "Train tickets, two nights, Borobudur sunrise.",
    story: "Why: Nara and Dimas have never seen Borobudur. The train from Jakarta, two nights in a guesthouse and the sunrise ticket — booked once the fund reaches Rp 8.000.000.",
  },
  {
    id: "g3", name: "New washing machine", target: 4500000, saved: 4500000,
    blurb: "Bought 18 Nov — goal complete!",
    story: "Why: the old machine died in October. This goal was funded from the October surplus and the machine was bought on 18 November.",
  },
];

// Closed books for the reports chart. November's income is the live total
// and its expenses are filled in from the ledger at render time.
export const MONTHLY_HISTORY = [
  { month: "2026-07", income: 20400000, expenses: 13120000 },
  { month: "2026-08", income: 19850000, expenses: 14280000 },
  { month: "2026-09", income: 21200000, expenses: 12890000 },
  { month: "2026-10", income: 20986250, expenses: 13540000 },
  { month: "2026-11", income: 20986250, expenses: 0 },
];

// ---- Derived figures: pure functions over a state object ---------------

// A state is { transactions, limits, bills, goals, movedToGoals } where
// limits maps category id -> rupiah ceiling and movedToGoals is the total
// of deposits made into goals during this session's lifetime (money that
// has left the everyday balance since the seed).
export function freshState() {
  return {
    transactions: SEED_TRANSACTIONS.map((t) => ({ ...t })),
    limits: Object.fromEntries(CATEGORIES.map((c) => [c.id, c.limit])),
    bills: SEED_BILLS.map((b) => ({ ...b })),
    goals: SEED_GOALS.map((g) => ({ ...g })),
    movedToGoals: 0,
  };
}

// Newest first, keeping the seed's order among rows that share a date
// (the sort is stable, so a salary booked before the rent on 1 Nov stays
// above it). New rows are added at the front, so they lead their day.
export function sortNewest(transactions) {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
}

export function monthTotals(state) {
  let income = 0;
  let spent = 0;
  for (const t of state.transactions) {
    if (t.kind === "in") income += t.amount;
    else spent += t.amount;
  }
  return { income, spent, net: income - spent };
}

export function currentBalance(state) {
  const { net } = monthTotals(state);
  return HOUSEHOLD.openingBalance + net - state.movedToGoals;
}

export function totalBudget(state) {
  return CATEGORIES.filter((c) => c.id !== "income")
    .reduce((sum, c) => sum + (state.limits[c.id] || 0), 0);
}

// Spending per category, biggest first. Categories with no spending are
// left out so charts and tables only show what actually happened.
export function spendByCategory(state) {
  const byId = new Map();
  for (const t of state.transactions) {
    if (t.kind !== "out") continue;
    byId.set(t.cat, (byId.get(t.cat) || 0) + t.amount);
  }
  return [...byId.entries()]
    .map(([id, spent]) => ({ cat: categoryById(id), spent }))
    .sort((a, b) => b.spent - a.spent);
}

// The donut shows the six biggest categories and lumps the rest into Other.
export function donutSlices(state) {
  const rows = spendByCategory(state);
  const top = rows.slice(0, 6);
  const rest = rows.slice(6).reduce((sum, r) => sum + r.spent, 0);
  if (rest > 0) top.push({ cat: categoryById("other"), spent: rest, grouped: true });
  return top;
}

export function biggestExpenses(state, count) {
  return state.transactions
    .filter((t) => t.kind === "out")
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .slice(0, count);
}
