import { NextRequest, NextResponse } from 'next/server';
import { GROQ_API_BASE, LLM_MODEL } from '@/lib/constants';

export const runtime = 'nodejs';

/**
 * Compresses older transcript content into a 1–2 paragraph rolling summary.
 * Called every ROLLING_SUMMARY_EVERY_N_CHUNKS chunks. Keeps the suggestion
 * context window lean while preserving high-level meeting state (names,
 * goals, decisions, claims).
 */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-groq-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 401 });
  }

  try {
    const { transcript, prevSummary } = await req.json();
    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ summary: prevSummary || '' });
    }

    const system = `You compress meeting transcripts into a tight running summary used by a live AI copilot. Keep these signals:
- Participants mentioned by name and what role they play.
- Key topics discussed.
- Specific numbers, dates, claims, decisions, blockers.
- Open questions that have not been resolved.
Output 1–2 short paragraphs, factual, no preamble. Do NOT include filler. If a previous summary is provided, MERGE it with the new transcript.`;

    const user = prevSummary?.trim()
      ? `PREVIOUS SUMMARY:\n${prevSummary.trim()}\n\nNEW TRANSCRIPT TO MERGE:\n${transcript}`
      : `TRANSCRIPT TO SUMMARIZE:\n${transcript}`;

    const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Groq API error: ${errorText}`, summary: prevSummary || '' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim() || prevSummary || '';
    return NextResponse.json({ summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
