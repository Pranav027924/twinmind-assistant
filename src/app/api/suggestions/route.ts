import { NextRequest, NextResponse } from 'next/server';
import { GROQ_API_BASE, LLM_MODEL, TEMPERATURE_SUGGESTIONS } from '@/lib/constants';
import { validateSuggestions } from '@/lib/validation';
import { buildContextBlock } from '@/lib/prompts';

export const runtime = 'nodejs';

interface RequestBody {
  transcript: string;
  systemPrompt: string;
  meetingType?: string;
  userRole?: string;
  meetingGoal?: string;
  rollingSummary?: string;
  avoidTitles?: string[];
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-groq-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 401 });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const {
      transcript,
      systemPrompt,
      meetingType,
      userRole,
      meetingGoal,
      rollingSummary,
      avoidTitles,
    } = body;

    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    // Compose system prompt with meeting-context block prepended.
    const contextBlock = buildContextBlock({ meetingType, userRole, meetingGoal });
    const systemContent = `${contextBlock}${systemPrompt}`;

    // User-message content: rolling summary (if any) + recent transcript +
    // anti-repetition titles. Recent transcript is the most important; we put
    // it last so it's nearest the model's attention.
    const parts: string[] = [];
    if (rollingSummary?.trim()) {
      parts.push(`SUMMARY OF EARLIER CONVERSATION:\n${rollingSummary.trim()}`);
    }
    if (avoidTitles && avoidTitles.length > 0) {
      parts.push(
        `AVOID REPEATING THESE RECENT SUGGESTION TITLES (produce different ideas):\n- ${avoidTitles.slice(0, 6).join('\n- ')}`
      );
    }
    parts.push(`RECENT TRANSCRIPT (focus here — pull triggerQuote from these lines):\n${transcript}`);
    parts.push('Now produce exactly 3 suggestions as a JSON object.');

    const userContent = parts.join('\n\n');

    const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userContent },
        ],
        response_format: { type: 'json_object' },
        temperature: TEMPERATURE_SUGGESTIONS,
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Groq API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'Empty response from model' }, { status: 500 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: 'Model returned invalid JSON' }, { status: 502 });
    }

    const suggestions = validateSuggestions(parsed);
    if (suggestions.length === 0) {
      return NextResponse.json(
        { error: 'No valid suggestions in response' },
        { status: 502 }
      );
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
