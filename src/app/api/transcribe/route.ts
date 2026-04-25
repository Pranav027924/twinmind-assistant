import { NextRequest, NextResponse } from 'next/server';
import {
  GROQ_API_BASE,
  WHISPER_MODEL,
  WHISPER_NO_SPEECH_THRESHOLD,
  WHISPER_LOGPROB_THRESHOLD,
  WHISPER_COMPRESSION_THRESHOLD,
} from '@/lib/constants';

export const runtime = 'nodejs';

interface WhisperSegment {
  id?: number;
  text?: string;
  avg_logprob?: number;
  no_speech_prob?: number;
  compression_ratio?: number;
}

interface WhisperVerboseJson {
  text?: string;
  segments?: WhisperSegment[];
}

function isReliableSegment(s: WhisperSegment): boolean {
  if (typeof s.no_speech_prob === 'number' && s.no_speech_prob > WHISPER_NO_SPEECH_THRESHOLD) {
    return false;
  }
  if (typeof s.avg_logprob === 'number' && s.avg_logprob < WHISPER_LOGPROB_THRESHOLD) {
    return false;
  }
  if (
    typeof s.compression_ratio === 'number' &&
    s.compression_ratio > WHISPER_COMPRESSION_THRESHOLD
  ) {
    return false;
  }
  return true;
}

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
    // verbose_json gives per-segment confidence/logprob/no_speech_prob so we
    // can drop hallucinated boilerplate that Whisper emits on silence.
    groqForm.append('response_format', 'verbose_json');
    groqForm.append('language', 'en');
    // temperature=0 makes Whisper's decoding deterministic (greedy), which
    // measurably reduces invented text on quiet audio.
    groqForm.append('temperature', '0');

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

    const data = (await response.json()) as WhisperVerboseJson;
    const segments = Array.isArray(data.segments) ? data.segments : [];

    let text: string;
    if (segments.length === 0) {
      // Server returned a flat string; trust it but it'll still pass through
      // the client-side hallucinations filter.
      text = (data.text || '').trim();
    } else {
      text = segments
        .filter(isReliableSegment)
        .map((s) => s.text || '')
        .join('')
        .trim();
    }

    return NextResponse.json({ text });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
