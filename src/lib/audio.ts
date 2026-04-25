import {
  VAD_SPEECH_RMS_THRESHOLD,
  VAD_WINDOW_MS,
  VAD_MIN_ACTIVE_WINDOWS,
} from './constants';

/**
 * Lightweight voice activity detector.
 *
 * Decodes the recorded audio chunk in the browser, walks fixed-size windows,
 * and reports whether enough of them carry speech-level RMS energy.
 *
 * The goal is to prevent silent / near-silent chunks from ever reaching
 * Whisper-Large-v3, which is notorious for hallucinating boilerplate
 * ("thanks for watching", "subscribe", looping phrases) on quiet input.
 *
 * On any failure we conservatively return `true` so legitimate audio is
 * never dropped because of a decoder error.
 */

type CachedCtx = AudioContext | null;
let cachedCtx: CachedCtx = null;

function getAudioContext(): CachedCtx {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (cachedCtx && cachedCtx.state !== 'closed') return cachedCtx;
  try {
    cachedCtx = new Ctor();
    return cachedCtx;
  } catch {
    return null;
  }
}

export interface VadResult {
  hasSpeech: boolean;
  maxRms: number;
  activeWindows: number;
  totalWindows: number;
}

export async function analyzeAudioActivity(blob: Blob): Promise<VadResult> {
  const fallback: VadResult = {
    hasSpeech: true,
    maxRms: 0,
    activeWindows: 0,
    totalWindows: 0,
  };

  try {
    if (!blob || blob.size === 0) {
      return { ...fallback, hasSpeech: false };
    }

    const ctx = getAudioContext();
    if (!ctx) return fallback;

    const arrayBuffer = await blob.arrayBuffer();
    // decodeAudioData returns a copy so we can reuse the context safely.
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));

    const channel = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const windowSize = Math.max(1, Math.floor(sampleRate * (VAD_WINDOW_MS / 1000)));

    let maxRms = 0;
    let activeWindows = 0;
    let totalWindows = 0;

    for (let i = 0; i < channel.length; i += windowSize) {
      const end = Math.min(i + windowSize, channel.length);
      let sumSquares = 0;
      for (let j = i; j < end; j++) {
        const v = channel[j];
        sumSquares += v * v;
      }
      const rms = Math.sqrt(sumSquares / Math.max(1, end - i));
      if (rms > maxRms) maxRms = rms;
      if (rms > VAD_SPEECH_RMS_THRESHOLD) activeWindows++;
      totalWindows++;
    }

    return {
      hasSpeech: activeWindows >= VAD_MIN_ACTIVE_WINDOWS,
      maxRms,
      activeWindows,
      totalWindows,
    };
  } catch {
    // Decoding failure: don't drop legitimate audio.
    return fallback;
  }
}
