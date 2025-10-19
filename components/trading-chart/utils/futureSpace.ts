// @ts-nocheck
// Helpers to ensure future whitespace on the chart so drawings can extend past the last candle

export function ensureFutureWhitespace(chart: any, bars: number = 20) {
  try {
    if (!chart) return;
    chart.timeScale().applyOptions({ rightOffset: Math.max(bars, 12) });
  } catch {}
}
