import { CategoryTree } from '@/domain/categoryTree';
import { CATALOG } from '../catalog';
import { CATEGORIES } from '../categories';
import { CONFIG } from '../config';
import { RAW_DECKS } from '../decks';

const tree = new CategoryTree(CATEGORIES);

describe('catalogue — cohérence des catégories', () => {
  it('chaque parentId référence une catégorie existante', () => {
    for (const c of CATEGORIES) {
      if (c.parentId) expect(tree.has(c.parentId)).toBe(true);
    }
  });

  it('les ids de catégories sont uniques', () => {
    expect(new Set(CATEGORIES.map((c) => c.id)).size).toBe(CATEGORIES.length);
  });
});

describe('catalogue — decks', () => {
  it('le nombre de decks gratuits est celui annoncé dans CONFIG', () => {
    const free = CATALOG.decks.filter((d) => d.tier === 'free');
    expect(free).toHaveLength(CONFIG.FREE_DECK_COUNT);
  });

  it('chaque deck pointe vers des catégories existantes', () => {
    for (const d of CATALOG.decks) {
      expect(tree.has(d.categoryId)).toBe(true);
      if (d.subcategoryId) expect(tree.has(d.subcategoryId)).toBe(true);
    }
  });

  it('les decks premium ont un productId et un volume dans les bornes', () => {
    for (const d of CATALOG.decks.filter((x) => x.tier === 'premium')) {
      expect(d.productId).toBeTruthy();
      expect(d.questionCount).toBeGreaterThanOrEqual(CONFIG.DECK_QUESTION_MIN);
      expect(d.questionCount).toBeLessThanOrEqual(CONFIG.DECK_QUESTION_MAX);
    }
  });

  it('les ids de decks sont uniques', () => {
    expect(new Set(CATALOG.decks.map((d) => d.id)).size).toBe(CATALOG.decks.length);
  });

  it('les previewQuestionIds existent dans leur deck', () => {
    for (const raw of RAW_DECKS) {
      const ids = new Set(raw.questions.map((q) => q.id));
      for (const pid of raw.previewQuestionIds ?? []) {
        expect(ids.has(pid)).toBe(true);
      }
    }
  });
});

describe('catalogue — questions', () => {
  it('les ids de questions sont globalement uniques', () => {
    const ids = CATALOG.questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('chaque question porte un deckId et des catégories valides', () => {
    for (const q of CATALOG.questions) {
      expect(CATALOG.decks.some((d) => d.id === q.deckId)).toBe(true);
      expect(tree.has(q.categoryId)).toBe(true);
      if (q.subcategoryId) expect(tree.has(q.subcategoryId)).toBe(true);
    }
  });

  it('les questions single/boolean ont exactement une bonne réponse', () => {
    for (const q of CATALOG.questions) {
      if (q.type === 'single' || q.type === 'boolean') {
        expect(q.answers.filter((a) => a.correct)).toHaveLength(1);
      }
      expect(q.answers.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('la difficulté est comprise entre 1 et 5', () => {
    for (const q of CATALOG.questions) {
      expect(q.difficulty).toBeGreaterThanOrEqual(1);
      expect(q.difficulty).toBeLessThanOrEqual(5);
    }
  });
});
