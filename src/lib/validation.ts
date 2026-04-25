import type { Suggestion, SuggestionType, FactCheckConfidence } from '@/types';

const VALID_TYPES: SuggestionType[] = [
  'question_to_ask',
  'talking_point',
  'answer',
  'fact_check',
  'clarification',
];

const VALID_CONFIDENCE: FactCheckConfidence[] = ['verified', 'likely', 'unverified'];

export interface RawSuggestion {
  type?: unknown;
  title?: unknown;
  preview?: unknown;
  triggerQuote?: unknown;
  confidence?: unknown;
}

/**
 * Strict validation — drop suggestions that don't conform.
 * Fact-check without confidence falls back to "unverified".
 */
export function validateSuggestions(raw: unknown): Omit<Suggestion, 'id'>[] {
  if (!raw || typeof raw !== 'object') return [];
  const arr = (raw as { suggestions?: unknown }).suggestions;
  if (!Array.isArray(arr)) return [];

  const valid: Omit<Suggestion, 'id'>[] = [];
  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const s = item as RawSuggestion;
    if (typeof s.type !== 'string' || !VALID_TYPES.includes(s.type as SuggestionType)) continue;
    if (typeof s.title !== 'string' || !s.title.trim()) continue;
    if (typeof s.preview !== 'string' || !s.preview.trim()) continue;

    const out: Omit<Suggestion, 'id'> = {
      type: s.type as SuggestionType,
      title: s.title.trim(),
      preview: s.preview.trim(),
    };
    if (typeof s.triggerQuote === 'string' && s.triggerQuote.trim()) {
      out.triggerQuote = s.triggerQuote.trim().slice(0, 300);
    }
    if (out.type === 'fact_check') {
      out.confidence = VALID_CONFIDENCE.includes(s.confidence as FactCheckConfidence)
        ? (s.confidence as FactCheckConfidence)
        : 'unverified';
    }
    valid.push(out);
  }
  return valid.slice(0, 3);
}
