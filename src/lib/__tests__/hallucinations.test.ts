import { describe, it, expect } from 'vitest';
import { isLikelyHallucination } from '../hallucinations';

describe('isLikelyHallucination', () => {
  it.each([
    'thank you',
    'Thanks for watching',
    'Subscribe to the channel',
    'See you next time',
    'okay.',
    'you',
    '[Music]',
    '(applause)',
    '......',
  ])('flags %s', (s) => {
    expect(isLikelyHallucination(s)).toBe(true);
  });

  it('flags repeating-token loops', () => {
    expect(isLikelyHallucination('yeah yeah yeah yeah yeah yeah yeah')).toBe(true);
  });

  it('flags repeated multi-word phrases', () => {
    expect(
      isLikelyHallucination(
        'thanks for watching thanks for watching thanks for watching'
      )
    ).toBe(true);
  });

  it('flags multi-sentence boilerplate', () => {
    expect(
      isLikelyHallucination('Thanks for watching. Subscribe to the channel.')
    ).toBe(true);
  });

  it.each([
    'Thanks for tuning in!',
    "I'll see you next time.",
    'mhm',
    'um.',
    'all right',
    "That's it for today.",
  ])('flags additional Whisper outro: %s', (s) => {
    expect(isLikelyHallucination(s)).toBe(true);
  });

  it('does not flag normal speech', () => {
    expect(
      isLikelyHallucination(
        "So our ARR is 600K and we're growing 40% month over month."
      )
    ).toBe(false);
  });

  it('does not flag short legitimate questions', () => {
    expect(isLikelyHallucination('What is our churn rate this quarter?')).toBe(false);
  });
});
