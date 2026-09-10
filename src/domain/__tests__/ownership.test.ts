import { isDeckAccessible, isTemporarilyFree } from '../ownership';
import type { Deck } from '../types';

const NOW = Date.parse('2026-09-10T00:00:00.000Z');

const deck = (over: Partial<Deck> = {}): Deck => ({
  id: 'd1',
  name: 'Deck',
  description: '',
  emoji: '🎲',
  categoryId: 'cat',
  tier: 'premium',
  questionCount: 50,
  averageDifficulty: 2,
  releasedAt: '2026-01-01T00:00:00.000Z',
  ...over,
});

describe('isTemporarilyFree', () => {
  it('is false without freeUntil', () => {
    expect(isTemporarilyFree(deck(), NOW)).toBe(false);
  });

  it('is true while freeUntil is in the future', () => {
    expect(isTemporarilyFree(deck({ freeUntil: '2026-09-11T00:00:00.000Z' }), NOW)).toBe(true);
  });

  it('is false once freeUntil has passed', () => {
    expect(isTemporarilyFree(deck({ freeUntil: '2026-09-09T00:00:00.000Z' }), NOW)).toBe(false);
  });
});

describe('isDeckAccessible', () => {
  it('is always accessible when tier is free', () => {
    expect(isDeckAccessible(deck({ tier: 'free' }), [], NOW)).toBe(true);
  });

  it('is accessible while temporarily free, regardless of ownership', () => {
    const promo = deck({ tier: 'premium', freeUntil: '2026-09-11T00:00:00.000Z' });
    expect(isDeckAccessible(promo, [], NOW)).toBe(true);
  });

  it('is accessible once its id is owned', () => {
    expect(isDeckAccessible(deck({ id: 'd1' }), ['d1'], NOW)).toBe(true);
  });

  it('is not accessible when premium and unowned', () => {
    expect(isDeckAccessible(deck({ id: 'd1' }), ['other'], NOW)).toBe(false);
    expect(isDeckAccessible(deck({ id: 'd1' }), [], NOW)).toBe(false);
  });
});
