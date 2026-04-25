import { describe, it, expect } from 'vitest';
import { validateSuggestions } from '../validation';

describe('validateSuggestions', () => {
  it('keeps well-formed suggestions and trims preview/title', () => {
    const out = validateSuggestions({
      suggestions: [
        {
          type: 'question_to_ask',
          title: '  Probe unit economics ',
          preview: ' What is the CAC payback? ',
          triggerQuote: 'our ARR is 600K',
        },
      ],
    });
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Probe unit economics');
    expect(out[0].preview).toBe('What is the CAC payback?');
    expect(out[0].triggerQuote).toBe('our ARR is 600K');
  });

  it('drops suggestions with invalid type', () => {
    const out = validateSuggestions({
      suggestions: [
        { type: 'Question', title: 'x', preview: 'y' },
        { type: 'answer', title: 'a', preview: 'b' },
      ],
    });
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe('answer');
  });

  it('defaults fact_check confidence to unverified when invalid', () => {
    const out = validateSuggestions({
      suggestions: [
        { type: 'fact_check', title: 't', preview: 'p', confidence: 'maybe' },
        { type: 'fact_check', title: 't2', preview: 'p2' },
      ],
    });
    expect(out[0].confidence).toBe('unverified');
    expect(out[1].confidence).toBe('unverified');
  });

  it('preserves valid fact_check confidence', () => {
    const out = validateSuggestions({
      suggestions: [
        { type: 'fact_check', title: 't', preview: 'p', confidence: 'verified' },
      ],
    });
    expect(out[0].confidence).toBe('verified');
  });

  it('caps output at 3 suggestions', () => {
    const out = validateSuggestions({
      suggestions: Array.from({ length: 5 }, (_, i) => ({
        type: 'answer',
        title: `t${i}`,
        preview: `p${i}`,
      })),
    });
    expect(out).toHaveLength(3);
  });

  it('returns empty array on malformed input', () => {
    expect(validateSuggestions(null)).toEqual([]);
    expect(validateSuggestions({})).toEqual([]);
    expect(validateSuggestions({ suggestions: 'not-an-array' })).toEqual([]);
    expect(validateSuggestions({ suggestions: [{}, { type: 'answer' }] })).toEqual([]);
  });
});
