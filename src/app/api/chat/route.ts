import { NextRequest } from 'next/server';
import { GROQ_API_BASE, LLM_MODEL, TEMPERATURE_CHAT, TEMPERATURE_DETAILED } from '@/lib/constants';
import { buildContextBlock } from '@/lib/prompts';

export const runtime = 'nodejs';

interface RequestBody {
  messages: { role: 'user' | 'assistant'; content: string }[];
  systemPrompt: string;
  transcript?: string;
  meetingType?: string;
  userRole?: string;
  meetingGoal?: string;
  // When set, this request was triggered by a suggestion-card click.
  // We use a slightly lower temperature for these (more grounded answers).
  isDetailedAnswer?: boolean;
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-groq-api-key');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key is required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const {
      messages,
      systemPrompt,
      transcript,
      meetingType,
      userRole,
      meetingGoal,
      isDetailedAnswer,
    } = body;

    const contextBlock = buildContextBlock({ meetingType, userRole, meetingGoal });

    const transcriptBlock = transcript?.trim()
      ? `\n\n---\nCONVERSATION TRANSCRIPT (relevant window):\n${transcript.trim()}\n---`
      : '';

    const systemContent = `${contextBlock}${systemPrompt}${transcriptBlock}`;

    const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [{ role: 'system', content: systemContent }, ...messages],
        stream: true,
        temperature: isDetailedAnswer ? TEMPERATURE_DETAILED : TEMPERATURE_CHAT,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
