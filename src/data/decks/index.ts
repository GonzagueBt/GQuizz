import type { Difficulty, QuestionType } from '@/domain/types';

import cultureGenerale from './culture-generale.json';
import histoireDeFrance from './histoire-de-france.json';
import geographie from './geographie.json';
import sciences from './sciences.json';
import sport from './sport.json';
import musique from './musique.json';
import revolutionFrancaise from './revolution-francaise.json';
import histoireAviation from './histoire-aviation.json';
import conqueteSpatiale from './conquete-spatiale.json';

/** Forme d'une question dans un fichier de deck (le `deckId` est injecté au chargement). */
export interface RawQuestion {
  id: string;
  categoryId: string;
  subcategoryId?: string;
  difficulty: Difficulty;
  type: QuestionType;
  prompt: string;
  answers: { id: string; text: string; correct: boolean }[];
  explanation?: string;
  media?: { kind: 'image' | 'audio'; src: string };
}

/** Forme d'un fichier de deck. */
export interface RawDeck {
  id: string;
  name: string;
  description: string;
  emoji: string;
  image?: string;
  categoryId: string;
  subcategoryId?: string;
  tier: 'free' | 'premium';
  productId?: string;
  priceHint?: string;
  questionCount: number;
  averageDifficulty: Difficulty;
  releasedAt: string;
  tags?: string[];
  freeUntil?: string;
  previewQuestionIds?: string[];
  questions: RawQuestion[];
}

/**
 * Registre des decks livrés avec l'app. Ajouter un deck = créer le JSON et
 * l'ajouter ici. L'ordre définit l'ordre d'affichage par défaut.
 */
export const RAW_DECKS: RawDeck[] = [
  cultureGenerale as RawDeck,
  histoireDeFrance as RawDeck,
  geographie as RawDeck,
  sciences as RawDeck,
  sport as RawDeck,
  musique as RawDeck,
  revolutionFrancaise as RawDeck,
  histoireAviation as RawDeck,
  conqueteSpatiale as RawDeck,
];
