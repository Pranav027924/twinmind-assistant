/** Format a millis timestamp as HH:MM. Used to anchor LLM responses. */
export function formatHHMM(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Format a millis timestamp as HH:MM:SS for transcript lines. */
export function formatHHMMSS(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/**
 * Build the prefixed transcript string sent to the model.
 * Each line is prefixed with [HH:MM] so the LLM can quote timestamps back.
 */
export function buildTranscriptText(
  chunks: { text: string; timestamp: number }[],
  maxChunks?: number
): string {
  const sliced = maxChunks && maxChunks > 0 ? chunks.slice(-maxChunks) : chunks;
  return sliced.map((c) => `[${formatHHMM(c.timestamp)}] ${c.text}`).join('\n\n');
}
