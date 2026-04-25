import { describe, it, expect } from 'vitest';
import { parseSseStream } from '../sse';

function makeStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
}

describe('parseSseStream', () => {
  it('parses a sequence of data: events split on \\n\\n', async () => {
    const stream = makeStream([
      'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
      'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
    ]);
    const out: string[] = [];
    await parseSseStream(stream, (d) => out.push(d));
    expect(out).toEqual([
      '{"choices":[{"delta":{"content":"Hello"}}]}',
      '{"choices":[{"delta":{"content":" world"}}]}',
    ]);
  });

  it('handles events split across read() boundaries', async () => {
    const stream = makeStream([
      'data: {"choi',
      'ces":[{"delta":{"content":"X"}}]}\n',
      '\ndata: {"choices":[{"delta":{"content":"Y"}}]}\n\n',
    ]);
    const out: string[] = [];
    await parseSseStream(stream, (d) => out.push(d));
    expect(out).toHaveLength(2);
  });

  it('stops on [DONE]', async () => {
    const stream = makeStream([
      'data: A\n\n',
      'data: [DONE]\n\n',
      'data: B\n\n',
    ]);
    const out: string[] = [];
    await parseSseStream(stream, (d) => out.push(d));
    expect(out).toEqual(['A']);
  });

  it('supports CRLF event separators', async () => {
    const stream = makeStream(['data: x\r\n\r\ndata: y\r\n\r\n']);
    const out: string[] = [];
    await parseSseStream(stream, (d) => out.push(d));
    expect(out).toEqual(['x', 'y']);
  });
});
