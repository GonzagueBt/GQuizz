/**
 * Constantes produit ajustables sans toucher à la logique.
 * Voir ARCHITECTURE.md §7 et §10.
 */
export const CONFIG = {
  /** Decks marqués `free` livrés avec l'app. Un test de garde vérifie la cohérence.
   *  Tous les decks sont temporairement gratuits (tier: 'free') le temps de
   *  finaliser le contenu ; `productId`/`priceHint` restent renseignés dans
   *  leur JSON pour repasser un deck en premium en changeant juste `tier`. */
  FREE_DECK_COUNT: 12,

  /** Prix indicatif par défaut d'un deck premium (le vrai prix vient du store). */
  PREMIUM_PRICE_DEFAULT: '1,99 €',

  /** Bornes de taille d'un deck premium (spec §5). */
  DECK_QUESTION_MIN: 50,
  DECK_QUESTION_MAX: 200,

  /** Une partie enchaîne TOUTES les questions du pool (mélangées) — pas de
   *  format court. On joue jusqu'à épuiser le deck ou les vies. */
  STARTING_LIVES: 3,

  /** Délai avant passage auto à la question suivante quand la réponse est juste
   *  (le temps de voir la réponse s'allumer en vert). Réglage `autoAdvanceOnCorrect`. */
  AUTO_ADVANCE_DELAY_MS: 550,

  /** Bonnes réponses consécutives pour qu'une question soit "maîtrisée". */
  MASTERY_STREAK: 3,

  /** Score : base + bonus difficulté × (diff - 1) + bonus streak × streak. */
  SCORE_BASE: 100,
  SCORE_DIFFICULTY_BONUS: 25,
  SCORE_STREAK_BONUS: 10,
} as const;

export type Config = typeof CONFIG;
