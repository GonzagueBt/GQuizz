import { CategoryTree } from './categoryTree';
import { isQuestionAllowed, resolveAllowedCategoryIds } from './preferences';
import type { CategoryPreferences, Category, GameMode, Question } from './types';

export interface PoolInput {
  mode: GameMode;
  questions: Question[];
  categories: Category[];
  prefs: CategoryPreferences;
  /** free => toujours true ; premium => selon les entitlements. */
  isDeckOwned: (deckId: string) => boolean;
  /** Pool figé fourni par le contenu, pour les modes daily/event. */
  resolveFixedPool?: (mode: GameMode) => Question[];
}

export class PoolError extends Error {
  constructor(
    public readonly reason: 'deck-not-owned' | 'empty-pool' | 'unsupported-mode',
    message: string,
  ) {
    super(message);
    this.name = 'PoolError';
  }
}

/**
 * Construit le pool de questions d'une partie selon le mode.
 *
 * | Mode   | Pool                                                                    |
 * |--------|-------------------------------------------------------------------------|
 * | global | questions des decks possédés ∩ catégories autorisées par les prefs      |
 * | deck   | toutes les questions du deck (si possédé) ; prefs ignorées             |
 * | daily  | pool figé (resolveFixedPool)                                           |
 * | event  | pool figé (resolveFixedPool)                                           |
 */
export function buildQuestionPool(input: PoolInput): Question[] {
  const { mode } = input;

  switch (mode.kind) {
    case 'global':
      return globalPool(input);
    case 'deck':
      return deckPool(input, mode.deckId);
    case 'daily':
    case 'event': {
      const pool = input.resolveFixedPool?.(mode) ?? [];
      if (pool.length === 0) {
        throw new PoolError('empty-pool', `Aucune question pour le mode ${mode.kind}.`);
      }
      return pool;
    }
    default: {
      // Exhaustivité : si un GameMode est ajouté sans être géré, ceci ne compile plus.
      const _never: never = mode;
      throw new PoolError('unsupported-mode', `Mode non géré: ${JSON.stringify(_never)}`);
    }
  }
}

function globalPool(input: PoolInput): Question[] {
  const tree = new CategoryTree(input.categories);
  const allowed = resolveAllowedCategoryIds(input.prefs, tree);

  const pool = input.questions.filter(
    (q) => input.isDeckOwned(q.deckId) && isQuestionAllowed(q, allowed, tree),
  );

  if (pool.length === 0) {
    throw new PoolError(
      'empty-pool',
      'Aucune question ne correspond à tes catégories et tes decks. Élargis tes préférences ou débloque un deck.',
    );
  }
  return pool;
}

function deckPool(input: PoolInput, deckId: string): Question[] {
  if (!input.isDeckOwned(deckId)) {
    throw new PoolError('deck-not-owned', `Le deck ${deckId} n'est pas débloqué.`);
  }
  const pool = input.questions.filter((q) => q.deckId === deckId);
  if (pool.length === 0) {
    throw new PoolError('empty-pool', `Le deck ${deckId} ne contient aucune question.`);
  }
  return pool;
}
