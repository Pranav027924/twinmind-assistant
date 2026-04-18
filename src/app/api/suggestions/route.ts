import { NextRequest, NextResponse } from 'next/server';
import { GROQ_API_BASE, LLM_MODEL } from '@/lib/constants';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-groq-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 401 });
  }

  try {
    const { transcript, systemPrompt } = await req.json();

    if (!transcript || !transcript.trim()) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const response = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Here is the live conversation transcript. Analyze it and generate 3 suggestions:\n\n${transcript}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024,
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

    const parsed = JSON.parse(content);
    return NextResponse.json(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
