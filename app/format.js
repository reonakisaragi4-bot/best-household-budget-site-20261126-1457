// Small formatting helpers: rupiah amounts, dates and percentages.
// Kept apart from the data so every view formats numbers the same way.

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// 20986250 -> "Rp 20.986.250". Negative values keep their minus sign.
// Non-numbers (a blank form field, a corrupt stored value) show as Rp 0
// rather than crashing the page that renders them.
export function rp(amount) {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const sign = safe < 0 ? "− " : "";
  const digits = String(Math.round(Math.abs(safe)))
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return sign + "Rp " + digits;
}

// Short form for chart centres: 12692500 -> "Rp 12.7 jt".
export function rpShort(amount) {
  if (amount >= 1000000) {
    const jt = amount / 1000000;
    return "Rp " + (Number.isInteger(jt) ? jt : jt.toFixed(1)) + " jt";
  }
  if (amount >= 1000) return "Rp " + Math.round(amount / 1000) + " rb";
  return rp(amount);
}

// "2026-11-26" -> "26 Nov 2026"
export function dayLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return d + " " + MONTH_SHORT[m - 1] + " " + y;
}

// "2026-12-05" -> "5 Dec 2026"
export function dueLabel(iso) {
  return dayLabel(iso);
}

// "2026-09" -> "Sep 2026"; "2026-11" -> "Nov 2026"
export function monthLabel(yyyymm) {
  const [y, m] = yyyymm.split("-").map(Number);
  return MONTH_SHORT[m - 1] + " " + y;
}

export function monthLong(yyyymm) {
  const [y, m] = yyyymm.split("-").map(Number);
  return MONTH_LONG[m - 1] + " " + y;
}

// Whole percent, rounded: 3496500 of 3200000 -> 109.
export function pctOf(part, whole) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

// Escape text that came from the family (notes, goal names) before it is
// put into the page, so a stray "<" can never break the markup.
export function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
