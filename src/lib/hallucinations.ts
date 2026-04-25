// Whisper-Large-v3 hallucinates a well-known set of YouTube/podcast outro
// phrases on silence and background noise. We filter these before they ever
// reach the transcript. Patterns are case-insensitive and trim-tolerant.
const HALLUCINATION_PATTERNS: RegExp[] = [
  // YouTube/podcast outros — by far the most common
  /^thank(s| you)[!.]*$/i,
  /^thanks for watching[!.]*$/i,
  /^thanks for listening[!.]*$/i,
  /^thanks for tuning in[!.]*$/i,
  /^thanks? for (joining|having) (us|me)[!.]*$/i,
  /^subscribe( to (the |my )?channel)?[!.]*$/i,
  /^(please )?like and subscribe[!.]*$/i,
  /^don'?t forget to (like|subscribe).*$/i,
  /^see you (next time|in the next (video|one))[!.]*$/i,
  /^(i'?ll )?see you (later|soon|tomorrow|next time)[!.]*$/i,
  /^that'?s (it|all) for (today|this video|now)[!.]*$/i,
  /^(welcome )?back to (the channel|my channel)[!.]*$/i,
  /^stay tuned[!.]*$/i,
  /^until next time[!.]*$/i,
  /^cheers[!.]*$/i,
  /^peace[!.]*$/i,

  // Single-token / interjection echoes — Whisper emits these from breath/noise
  /^you$/i,
  /^bye[!.]*$/i,
  /^goodbye[!.]*$/i,
  /^ok(ay)?[!.,]*$/i,
  /^all right(y|s)?[!.,]*$/i,
  /^(yeah|yep|nope|nah|mhm|uh-?huh|hmm+|um+|uh+|er+)[!.,]*$/i,
  /^the end[!.]*$/i,
  /^so[.,]?$/i,
  /^well[.,]?$/i,
  /^right[.,]?$/i,

  // Caption tokens — Whisper sometimes emits these as bracketed cues
  /^music$/i,
  /^applause$/i,
  /^silence$/i,
  /^\(?\[?(music|applause|laughter|silence|inaudible)\]?\)?$/i,

  // Pure punctuation / brackets
  /^\.+$/,
  /^\[.*\]$/,
  /^\(.*\)$/,
];

/** Detect a token that repeats > REPEAT_THRESHOLD of total tokens. */
function isRepeatLoop(text: string): boolean {
  const tokens = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length < 6) return false;
  const counts = new Map<string, number>();
  for (const t of tokens) counts.set(t, (counts.get(t) || 0) + 1);
  const max = Math.max(...counts.values());
  return max / tokens.length > 0.5;
}

/** Detect a phrase (3-6 words) that repeats back-to-back. */
function hasRepeatedPhrase(text: string): boolean {
  const lower = text.toLowerCase().replace(/[^\w\s]/g, '').trim();
  // Match the same 3-6 word run repeated 3+ times in a row.
  return /\b(\w+(?:\s+\w+){2,5})\b(?:\s+\1\b){2,}/i.test(lower);
}

function isHallucinationLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  if (t.length < 4) return true;
  if (HALLUCINATION_PATTERNS.some((p) => p.test(t))) return true;
  return false;
}

/**
 * Returns true when a transcript chunk appears to be a Whisper hallucination
 * (silence/noise) rather than real speech.
 *
 * Logic:
 *   - whole-string match against the boilerplate blacklist
 *   - repeat-loop detector (single token > 50% of tokens)
 *   - repeated-phrase detector (same 3–6 word run thrice in a row)
 *   - sentence-level: if every sentence is a known hallucination, drop
 */
export function isLikelyHallucination(rawText: string): boolean {
  const trimmed = rawText.trim();
  if (!trimmed || trimmed.length < 5) return true;
  if (HALLUCINATION_PATTERNS.some((p) => p.test(trimmed))) return true;
  if (isRepeatLoop(trimmed)) return true;
  if (hasRepeatedPhrase(trimmed)) return true;

  // Multi-sentence: split on terminators / newlines and check each piece.
  const sentences = trimmed
    .split(/[\n.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (sentences.length > 0 && sentences.every(isHallucinationLine)) {
    return true;
  }

  return false;
}
