// Charts, drawn as inline SVG from the live figures — no library, no
// network. Both builders return an SVG string the views drop into a card.

import { rp, rpShort, monthLabel } from "./format.js";

// Donut: one ring segment per slice. Each slice is a circle with a
// dash pattern — the coloured dash is the slice, the gap is the rest —
// rotated so the first slice starts at twelve o'clock.
export function donutSvg(slices, total) {
  const R = 80;
  // Nothing spent yet: a plain grey ring instead of a broken chart.
  if (!total || total <= 0) {
    return `<svg viewBox="0 0 220 220" width="220" height="220" role="img" aria-label="Spending by category donut chart"><circle cx="110" cy="110" r="${R}" fill="none" stroke="#e5ddd0" stroke-width="34" /><text x="110" y="104" text-anchor="middle" class="donut-centre-top">Total spent</text><text x="110" y="128" text-anchor="middle" class="donut-centre-amount">Rp 0</text></svg>`;
  }
  // pathLength=100 makes every dash unit a percent of the ring, so the
  // offset math stays in plain percentages: slice i starts where the
  // previous slices ended, and 25 puts the first slice at twelve o'clock.
  let startPct = 0;
  const rings = slices.map((s) => {
    const frac = total > 0 ? s.spent / total : 0;
    const len = Math.max(frac * 100 - 0.4, 0.4);
    const svg = `<circle cx="110" cy="110" r="${R}" fill="none" stroke="${s.cat.color}" stroke-width="34" pathLength="100" stroke-dasharray="${len.toFixed(1)} ${(100 - len).toFixed(1)}" stroke-dashoffset="${(25 - startPct).toFixed(1)}" />`;
    startPct += frac * 100;
    return svg;
  }).join("");
  return `<svg viewBox="0 0 220 220" width="220" height="220" role="img" aria-label="Spending by category donut chart">${rings}<text x="110" y="104" text-anchor="middle" class="donut-centre-top">Total spent</text><text x="110" y="128" text-anchor="middle" class="donut-centre-amount">${rpShort(total)}</text></svg>`;
}

// Grouped bars: income (green) next to expenses (red) for each month.
// `months` is [{ label, income, expenses }]. The tallest bar sets the scale.
export function monthBarsSvg(months) {
  const W = 640;
  const H = 260;
  const BASE = 220;
  const TOP = 18;
  const max = Math.max(...months.map((m) => Math.max(m.income, m.expenses)), 1);
  const slot = W / months.length;
  const barW = 34;
  let bars = "";
  let labels = "";
  months.forEach((m, i) => {
    const cx = slot * i + slot / 2;
    const inH = ((BASE - TOP) * m.income) / max;
    const outH = ((BASE - TOP) * m.expenses) / max;
    bars += `<rect x="${(cx - barW - 4).toFixed(1)}" y="${(BASE - inH).toFixed(1)}" width="${barW}" height="${inH.toFixed(1)}" rx="3" fill="#166534"><title>Income ${monthLabel(m.month)}: ${rp(m.income)}</title></rect>`;
    bars += `<rect x="${(cx + 4).toFixed(1)}" y="${(BASE - outH).toFixed(1)}" width="${barW}" height="${outH.toFixed(1)}" rx="3" fill="#b91c1c"><title>Expenses ${monthLabel(m.month)}: ${rp(m.expenses)}</title></rect>`;
    labels += `<text x="${cx.toFixed(1)}" y="${BASE + 20}" text-anchor="middle" class="bar-label">${monthLabel(m.month)}</text>`;
    labels += `<text x="${cx.toFixed(1)}" y="${(BASE - Math.max(inH, outH) - 8).toFixed(1)}" text-anchor="middle" class="bar-value">${rpShort(Math.max(m.income, m.expenses))}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Income versus expenses by month bar chart"><line x1="0" y1="${BASE}" x2="${W}" y2="${BASE}" class="bar-axis" />${bars}${labels}</svg>`;
}
