import type { Catalog, Deck, Question } from '@/domain/types';
import { CATEGORIES } from './categories';
import { RAW_DECKS, type RawDeck } from './decks';

function toDeck(raw: RawDeck): Deck {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    emoji: raw.emoji,
    image: raw.image,
    categoryId: raw.categoryId,
    subcategoryId: raw.subcategoryId,
    tier: raw.tier,
    productId: raw.productId,
    priceHint: raw.priceHint,
    questionCount: raw.questionCount,
    averageDifficulty: raw.averageDifficulty,
    previewQuestionIds: raw.previewQuestionIds,
    releasedAt: raw.releasedAt,
    tags: raw.tags,
    freeUntil: raw.freeUntil,
  };
}

function toQuestions(raw: RawDeck): Question[] {
  return raw.questions.map((q) => ({
    ...q,
    deckId: raw.id,
    categoryId: q.categoryId,
    subcategoryId: q.subcategoryId,
  }));
}

/**
 * Assemble le catalogue complet en mémoire à partir du contenu embarqué.
 * Appelé une fois au démarrage (voir `store/catalogStore` — à brancher).
 */
export function buildCatalog(rawDecks: RawDeck[] = RAW_DECKS): Catalog {
  const decks = rawDecks.map(toDeck);
  const questions = rawDecks.flatMap(toQuestions);
  return { categories: CATEGORIES, decks, questions };
}

export const CATALOG: Catalog = buildCatalog();

export function getDeck(id: string): Deck | undefined {
  return CATALOG.decks.find((d) => d.id === id);
}

export function questionsById(ids: string[]): Question[] {
  const set = new Set(ids);
  return CATALOG.questions.filter((q) => set.has(q.id));
}
