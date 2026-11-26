/* Canvas charts for HearthLedger, drawn by hand — no library, no network.
   Both charts respect the device pixel ratio so they stay crisp on phones. */

function setupCanvas(canvas, width, height) {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  return ctx;
}

export function drawDonut(canvas, slices) {
  const size = 220;
  const ctx = setupCanvas(canvas, size, size);
  const cx = size / 2;
  const cy = size / 2;
  const outer = 96;
  const inner = 58;
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  if (total <= 0) {
    ctx.fillStyle = '#ece5d2';
    ctx.beginPath();
    ctx.arc(cx, cy, outer, 0, Math.PI * 2);
    ctx.arc(cx, cy, inner, 0, Math.PI * 2, true);
    ctx.fill();
    return;
  }
  let angle = -Math.PI / 2;
  for (const slice of slices) {
    const sweep = (slice.value / total) * Math.PI * 2;
    ctx.fillStyle = slice.colour;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, outer, angle, angle + sweep);
    ctx.closePath();
    ctx.fill();
    angle += sweep;
  }
  ctx.fillStyle = '#fffdf7';
  ctx.beginPath();
  ctx.arc(cx, cy, inner, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#22302a';
  ctx.font = '700 15px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Total spent', cx, cy - 4);
  ctx.font = '800 17px system-ui, sans-serif';
  ctx.fillText(shortRupiah(total), cx, cy + 18);
}

function shortRupiah(amount) {
  if (amount >= 1000000) return 'Rp ' + (amount / 1000000).toFixed(1) + ' jt';
  if (amount >= 1000) return 'Rp ' + Math.round(amount / 1000) + ' rb';
  return 'Rp ' + amount;
}

export function drawMonthlyBars(canvas, rows) {
  const width = 640;
  const height = 280;
  const ctx = setupCanvas(canvas, width, height);
  const padLeft = 74;
  const padBottom = 34;
  const padTop = 16;
  const plotWidth = width - padLeft - 16;
  const plotHeight = height - padTop - padBottom;
  const max = Math.max(...rows.flatMap((r) => [r.income, r.expenses]), 1);
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;

  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#6b756e';
  ctx.textAlign = 'right';
  for (let value = 0; value <= top; value += step) {
    const y = padTop + plotHeight - (value / top) * plotHeight;
    ctx.strokeStyle = '#e3dcc9';
    ctx.beginPath();
    ctx.moveTo(padLeft, y);
    ctx.lineTo(width - 16, y);
    ctx.stroke();
    ctx.fillText(shortRupiah(value), padLeft - 8, y + 4);
  }

  const groupWidth = plotWidth / rows.length;
  const barWidth = Math.min(30, (groupWidth - 24) / 2);
  rows.forEach((row, i) => {
    const groupX = padLeft + i * groupWidth + groupWidth / 2;
    const incomeH = (row.income / top) * plotHeight;
    const expenseH = (row.expenses / top) * plotHeight;
    ctx.fillStyle = '#1e5c46';
    ctx.fillRect(groupX - barWidth - 3, padTop + plotHeight - incomeH, barWidth, incomeH);
    ctx.fillStyle = '#b3372f';
    ctx.fillRect(groupX + 3, padTop + plotHeight - expenseH, barWidth, expenseH);
    ctx.fillStyle = '#22302a';
    ctx.textAlign = 'center';
    ctx.fillText(row.month.slice(5) + '/' + row.month.slice(2, 4), groupX, height - 12);
  });

  ctx.textAlign = 'left';
  ctx.fillStyle = '#1e5c46';
  ctx.fillRect(padLeft, height - 2, 12, 0); // keeps the legend row aligned below
}

export function drawBarsLegend() {
  return (
    '<span class="pill" style="background:#e7ecdf">■ Income</span> ' +
    '<span class="pill bad" style="background:#f9dcd9">■ Expenses</span>'
  );
}

function niceStep(max) {
  const raw = max / 4;
  const power = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / power;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * power;
}
