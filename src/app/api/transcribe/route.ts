import { NextRequest, NextResponse } from 'next/server';
import { GROQ_API_BASE, WHISPER_MODEL } from '@/lib/constants';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get('x-groq-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const audio = formData.get('file') as File;
    if (!audio) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    const groqForm = new FormData();
    groqForm.append('file', audio, 'audio.webm');
    groqForm.append('model', WHISPER_MODEL);
    groqForm.append('response_format', 'text');
    groqForm.append('language', 'en');

    const response = await fetch(`${GROQ_API_BASE}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: groqForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Groq API error: ${errorText}` },
        { status: response.status }
      );
    }

    const text = await response.text();
    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
