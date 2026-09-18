// Small shared chart helpers reused across every Portfolio Presentations report screen —
// same SVG-line / conic-gradient-donut approach as investor/portfolio-dashboard.

export function buildLinePath(values: number[]): string {
  if (values.length === 0) return '';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1 || 1)) * 100;
    const y = 100 - ((v - min) / range) * 90 - 5;
    return `${x},${y.toFixed(1)}`;
  });
  return `M${points.join(' L')}`;
}

export interface AllocationSlice {
  label: string;
  value: number;
  colorVar: string;
}

export interface AllocationSegment extends AllocationSlice {
  pct: number;
  start: number;
  end: number;
}

/** Turns raw {label, value, colorVar} buckets into cumulative donut-chart segments + gradient string. */
export function buildDonutSegments(slices: AllocationSlice[]): AllocationSegment[] {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  let cumulative = 0;
  return slices
    .filter((s) => s.value > 0)
    .map((s) => {
      const pct = total > 0 ? Math.round((s.value / total) * 100) : 0;
      const start = cumulative;
      cumulative += pct;
      return { ...s, pct, start, end: cumulative };
    });
}

export function donutGradient(segments: AllocationSegment[]): string {
  return segments.map((seg) => `var(${seg.colorVar}) ${seg.start}% ${seg.end}%`).join(', ');
}

/** Simple annualised CAGR between two point-in-time values. */
export function cagr(invested: number, current: number, years: number): number {
  if (invested <= 0 || years <= 0) return 0;
  return Number(((Math.pow(current / invested, 1 / years) - 1) * 100).toFixed(2));
}

export function yearsBetween(startDate: string, endDate = new Date().toISOString().slice(0, 10)): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Math.max((end - start) / (365.25 * 24 * 60 * 60 * 1000), 0.01);
}

/** XIRR via Newton-Raphson on real dated cash flows (outflows negative, inflows positive) —
 * used by the Comprehensive Portfolio Chart's snapshot to compute Overall XIRR from actual
 * transaction dates/amounts plus a final "as-if-liquidated-today" inflow of current value. */
export function xirr(cashflows: { date: string; amount: number }[]): number {
  const flows = [...cashflows].sort((a, b) => a.date.localeCompare(b.date));
  if (flows.length < 2) return 0;
  const t0 = new Date(flows[0].date).getTime();
  const years = flows.map((cf) => (new Date(cf.date).getTime() - t0) / (365.25 * 24 * 60 * 60 * 1000));
  const npv = (rate: number) => flows.reduce((sum, cf, i) => sum + cf.amount / Math.pow(1 + rate, years[i]), 0);
  const dNpv = (rate: number) => flows.reduce((sum, cf, i) => sum - (years[i] * cf.amount) / Math.pow(1 + rate, years[i] + 1), 0);
  let rate = 0.1;
  for (let i = 0; i < 50; i++) {
    const df = dNpv(rate);
    if (Math.abs(df) < 1e-10) break;
    const next = Math.max(rate - npv(rate) / df, -0.99);
    if (!isFinite(next)) break;
    if (Math.abs(next - rate) < 1e-6) { rate = next; break; }
    rate = next;
  }
  return Number((rate * 100).toFixed(2));
}

export function downloadCsv(fileName: string, header: string[], rows: (string | number)[][]): void {
  const lines = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
