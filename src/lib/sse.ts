/**
 * Spec-compliant SSE parser. Splits on \n\n (or \r\n\r\n) event boundaries and
 * emits each `data:` payload to the consumer. Returns when the stream ends or
 * a `[DONE]` sentinel is received.
 */
export async function parseSseStream(
  stream: ReadableStream<Uint8Array>,
  onData: (data: string) => void,
  signal?: AbortSignal
): Promise<void> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      if (signal?.aborted) {
        await reader.cancel();
        return;
      }
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // Find the earliest of \n\n / \r\n\r\n that ends the next event.
      while (true) {
        const lf = buffer.indexOf('\n\n');
        const crlf = buffer.indexOf('\r\n\r\n');
        let idx = -1;
        let sepLen = 2;
        if (crlf !== -1 && (lf === -1 || crlf < lf)) {
          idx = crlf;
          sepLen = 4;
        } else if (lf !== -1) {
          idx = lf;
          sepLen = 2;
        }
        if (idx === -1) break;

        const rawEvent = buffer.slice(0, idx);
        buffer = buffer.slice(idx + sepLen);

        const dataLines = rawEvent
          .split(/\r?\n/)
          .filter((l) => l.startsWith('data:'))
          .map((l) => l.slice(5).trimStart());

        if (dataLines.length === 0) continue;
        const payload = dataLines.join('\n');
        if (payload === '[DONE]') return;
        onData(payload);
      }
    }
  } finally {
    reader.releaseLock();
  }
}
