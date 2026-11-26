/* Formatting helpers for HearthLedger: rupiah amounts, dates and month labels. */

export function formatIDR(amount) {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '-' : '';
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return sign + 'Rp ' + digits;
}

export function formatSignedIDR(amount) {
  return (amount < 0 ? '- ' : '+ ') + formatIDR(Math.abs(amount));
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function monthLabel(yyyymm) {
  const [year, month] = yyyymm.split('-').map(Number);
  return MONTH_NAMES[month - 1] + ' ' + year;
}

export function monthKeyOf(dateString) {
  return dateString.slice(0, 7);
}

export function formatDate(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return day + ' ' + MONTH_NAMES[month - 1].slice(0, 3) + ' ' + year;
}

export function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return now.getFullYear() + '-' + month + '-' + day;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
