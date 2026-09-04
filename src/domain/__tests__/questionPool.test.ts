import { buildQuestionPool, PoolError } from '../questionPool';
import type { Category, CategoryPreferences, Question } from '../types';

const categories: Category[] = [
  { id: 'espace', parentId: null, name: 'Espace', order: 1 },
  { id: 'musique', parentId: null, name: 'Musique', order: 2 },
];

const q = (id: string, deckId: string, categoryId: string): Question => ({
  id,
  deckId,
  categoryId,
  difficulty: 2,
  type: 'single',
  prompt: id,
  answers: [
    { id: 'a', text: 'a', correct: true },
    { id: 'b', text: 'b', correct: false },
  ],
});

const questions: Question[] = [
  q('free-espace', 'free-deck', 'espace'),
  q('free-musique', 'free-deck', 'musique'),
  q('premium-espace', 'premium-deck', 'espace'),
];

const prefs = (over: Partial<CategoryPreferences> = {}): CategoryPreferences => ({
  strategy: 'exclude',
  selected: [],
  version: 1,
  ...over,
});

describe('buildQuestionPool — global', () => {
  it('keeps only owned decks intersected with allowed categories', () => {
    const pool = buildQuestionPool({
      mode: { kind: 'global' },
      questions,
      categories,
      prefs: prefs({ strategy: 'include', selected: ['espace'] }),
      isDeckOwned: (d) => d === 'free-deck',
    });
    expect(pool.map((x) => x.id)).toEqual(['free-espace']);
  });

  it('includes premium questions once the deck is owned', () => {
    const pool = buildQuestionPool({
      mode: { kind: 'global' },
      questions,
      categories,
      prefs: prefs({ strategy: 'include', selected: ['espace'] }),
      isDeckOwned: () => true,
    });
    expect(pool.map((x) => x.id).sort()).toEqual(['free-espace', 'premium-espace']);
  });

  it('throws when nothing matches', () => {
    expect(() =>
      buildQuestionPool({
        mode: { kind: 'global' },
        questions,
        categories,
        prefs: prefs({ strategy: 'include', selected: ['musique'] }),
        isDeckOwned: (d) => d === 'premium-deck',
      }),
    ).toThrow(PoolError);
  });
});

describe('buildQuestionPool — deck', () => {
  it('returns every question of an owned deck, ignoring preferences', () => {
    const pool = buildQuestionPool({
      mode: { kind: 'deck', deckId: 'free-deck' },
      questions,
      categories,
      prefs: prefs({ strategy: 'include', selected: ['espace'] }),
      isDeckOwned: () => true,
    });
    expect(pool.map((x) => x.id).sort()).toEqual(['free-espace', 'free-musique']);
  });

  it('refuses a deck that is not owned', () => {
    try {
      buildQuestionPool({
        mode: { kind: 'deck', deckId: 'premium-deck' },
        questions,
        categories,
        prefs: prefs(),
        isDeckOwned: () => false,
      });
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(PoolError);
      expect((e as PoolError).reason).toBe('deck-not-owned');
    }
  });

  it('excludes mastered questions in deck mode', () => {
    const pool = buildQuestionPool({
      mode: { kind: 'deck', deckId: 'free-deck' },
      questions,
      categories,
      prefs: prefs(),
      isDeckOwned: () => true,
      isMastered: (id) => id === 'free-espace',
    });
    expect(pool.map((x) => x.id)).toEqual(['free-musique']);
  });

  it('falls back to the full deck when everything is mastered', () => {
    const pool = buildQuestionPool({
      mode: { kind: 'deck', deckId: 'free-deck' },
      questions,
      categories,
      prefs: prefs(),
      isDeckOwned: () => true,
      isMastered: () => true,
    });
    expect(pool.map((x) => x.id).sort()).toEqual(['free-espace', 'free-musique']);
  });
});

describe('buildQuestionPool — mastered in global mode', () => {
  it('keeps mastered questions in the global pool (for score)', () => {
    const pool = buildQuestionPool({
      mode: { kind: 'global' },
      questions,
      categories,
      prefs: prefs({ strategy: 'exclude', selected: [] }),
      isDeckOwned: () => true,
      isMastered: () => true,
    });
    expect(pool.map((x) => x.id).sort()).toEqual(
      ['free-espace', 'free-musique', 'premium-espace'].sort(),
    );
  });
});

describe('buildQuestionPool — fixed modes', () => {
  it('uses the resolver for daily', () => {
    const pool = buildQuestionPool({
      mode: { kind: 'daily', date: '2026-09-03' },
      questions,
      categories,
      prefs: prefs(),
      isDeckOwned: () => true,
      resolveFixedPool: () => [questions[0]],
    });
    expect(pool).toEqual([questions[0]]);
  });
});
