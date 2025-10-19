// @ts-nocheck
// Chart coordinate helpers

export function coordinateToTimeSafe(ts: any, x: number, containerEl: HTMLElement | null, lastTime: number | null): any {
  try {
    let t = ts.coordinateToTime(x);
    if (t != null) return t;
    const rect = containerEl?.getBoundingClientRect();
    const width = rect?.width || 1;
    const vr = (ts as any).getVisibleRange?.();
    if (vr && vr.from != null && vr.to != null) {
      const fromN = Number(vr.from as any);
      const toN = Number(vr.to as any);
      const ratio = Math.max(0, Math.min(1, x / width));
      const est = fromN + (toN - fromN) * ratio;
      return est as any;
    }
    const last = lastTime ?? Math.floor(Date.now() / 1000);
    return (last + 60) as any;
  } catch {
    return lastTime as any;
  }
}
