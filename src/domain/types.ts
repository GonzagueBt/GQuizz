/**
 * Types métier de GQuizz. Aucun import de `react-native` / `expo-*` ici :
 * ce module doit rester testable sans simulateur (voir ARCHITECTURE.md §1).
 */

export type Difficulty = 1 | 2 | 3 | 4 | 5;

/** Nœud de l'arbre de catégories. Stocké à plat, reconstruit à l'exécution. */
export interface Category {
  /** ex. "sport", "sport.football" — stable, jamais réutilisé pour autre chose. */
  id: string;
  parentId: string | null;
  name: string;
  emoji?: string;
  /** Tri d'affichage entre frères. */
  order: number;
}

export type QuestionType = 'single' | 'multiple' | 'boolean' | 'ordering';

export interface Answer {
  id: string;
  text: string;
  correct: boolean;
}

export interface Question {
  id: string;
  deckId: string;
  categoryId: string;
  subcategoryId?: string;
  difficulty: Difficulty;
  type: QuestionType;
  prompt: string;
  answers: Answer[];
  explanation?: string;
  media?: { kind: 'image' | 'audio'; src: string };
  meta?: { source?: string; updatedAt?: string };
}

export type DeckTier = 'free' | 'premium';

export interface Deck {
  id: string;
  name: string;
  description: string;
  emoji: string;
  image?: string;
  categoryId: string;
  subcategoryId?: string;
  tier: DeckTier;
  /** Identifiant produit store (obligatoire si premium). */
  productId?: string;
  /** Prix indicatif d'affichage ; le vrai prix vient du store. */
  priceHint?: string;
  /** Dénormalisé pour l'affichage. */
  questionCount: number;
  averageDifficulty: Difficulty;
  previewQuestionIds?: string[];
  /** ISO date. */
  releasedAt: string;
  tags?: string[];
  /** Deck gratuit temporairement (promo, événement). ISO date. */
  freeUntil?: string;
}

/** Contenu complet chargé en mémoire au démarrage. */
export interface Catalog {
  categories: Category[];
  decks: Deck[];
  questions: Question[];
}

/** Union discriminée : ajouter un mode ne casse rien (switch exhaustif). */
export type GameMode =
  | { kind: 'global' }
  | { kind: 'deck'; deckId: string }
  | { kind: 'daily'; date: string }
  | { kind: 'event'; eventId: string };

export type PreferenceStrategy = 'include' | 'exclude';

export interface CategoryPreferences {
  strategy: PreferenceStrategy;
  /** Ids de Category cochés, à n'importe quel niveau de l'arbre. */
  selected: string[];
  /** Schéma de persistance. */
  version: number;
}

export interface QuestionProgress {
  questionId: string;
  seen: number;
  correct: number;
  streak: number;
  /** ISO date, présent une fois la question maîtrisée. */
  masteredAt?: string;
}
