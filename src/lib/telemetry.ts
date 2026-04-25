import type { LatencySample } from '@/types';

// Lightweight in-memory ring buffer for latency samples.
// Surfaced in dev as a tiny footer; logged to console in all envs.
const samples: LatencySample[] = [];
const listeners = new Set<() => void>();
const MAX_SAMPLES = 50;

export function recordLatency(label: LatencySample['label'], durationMs: number) {
  const sample: LatencySample = { label, durationMs, timestamp: Date.now() };
  samples.push(sample);
  if (samples.length > MAX_SAMPLES) samples.shift();
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[latency] ${label}: ${durationMs.toFixed(0)}ms`);
  }
  listeners.forEach((l) => l());
}

export function getLatencySamples(): LatencySample[] {
  return [...samples];
}

export function p50(label: LatencySample['label']): number | null {
  const xs = samples.filter((s) => s.label === label).map((s) => s.durationMs).sort((a, b) => a - b);
  if (xs.length === 0) return null;
  return xs[Math.floor(xs.length / 2)];
}

export function subscribeLatency(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Time a promise; returns the value and records latency. */
export async function timed<T>(
  label: LatencySample['label'],
  fn: () => Promise<T>
): Promise<T> {
  const t0 = performance.now();
  try {
    return await fn();
  } finally {
    recordLatency(label, performance.now() - t0);
  }
}
