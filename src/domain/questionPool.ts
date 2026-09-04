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
  /**
   * Question actuellement maîtrisée ? En mode `deck` ces questions sont exclues
   * du pool (« ne me la pose plus ») ; en mode `global` elles restent (pour le
   * score). Si tout un deck est maîtrisé, on retombe sur le deck complet.
   */
  isMastered?: (questionId: string) => boolean;
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
 * | Mode   | Pool                                                                        |
 * |--------|----------------------------------------------------------------------------|
 * | global | decks possédés ∩ catégories autorisées ; les maîtrisées restent incluses   |
 * | deck   | toutes les questions du deck (si possédé), **maîtrisées exclues** ; prefs ignorées |
 * | daily  | pool figé (resolveFixedPool)                                              |
 * | event  | pool figé (resolveFixedPool)                                              |
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
  const all = input.questions.filter((q) => q.deckId === deckId);
  if (all.length === 0) {
    throw new PoolError('empty-pool', `Le deck ${deckId} ne contient aucune question.`);
  }

  const isMastered = input.isMastered;
  if (!isMastered) return all;

  const unmastered = all.filter((q) => !isMastered(q.id));
  // Deck entièrement maîtrisé : on le rejoue quand même.
  return unmastered.length > 0 ? unmastered : all;
}
