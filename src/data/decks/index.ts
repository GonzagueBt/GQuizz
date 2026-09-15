import type { Difficulty, QuestionType } from '@/domain/types';

import sciences from './sciences.json';
import sport from './sport.json';
import musique from './musique.json';
import cinema from './cinema.json';
import litterature from './litterature.json';
import revolutionFrancaise from './revolution-francaise.json';
import charlemagne from './charlemagne.json';
import henriIv from './henri-iv.json';
import histoireAviation from './histoire-aviation.json';
import conqueteSpatiale from './conquete-spatiale.json';
import univers from './univers.json';
import secondeGuerreMondiale from './seconde-guerre-mondiale.json';
import capitalesDuMonde from './capitales-du-monde.json';
import departementsFrancais from './departements-francais.json';
import egypteAntique from './egypte-antique.json';
import romeAntique from './rome-antique.json';
import greceAntique from './grece-antique.json';
import napoleon from './napoleon.json';
import louisXiv from './louis-xiv.json';
import jeanneDarc from './jeanne-darc.json';
import xixeSiecle from './xixe-siecle.json';
import premiereGuerreMondiale from './premiere-guerre-mondiale.json';
import guerreFroide from './guerre-froide.json';
import cinquiemeRepublique from './cinquieme-republique.json';
import drapeauxDuMonde from './drapeaux-du-monde.json';
import fleuvesEtLacs from './fleuves-et-lacs.json';
import montagnesEtVolcans from './montagnes-et-volcans.json';
import oceansEtMers from './oceans-et-mers.json';
import desertsEtClimats from './deserts-et-climats.json';
import geographieAfrique from './geographie-afrique.json';
import geographieAsie from './geographie-asie.json';
import geographieAmeriques from './geographie-ameriques.json';
import regionsDeFrance from './regions-de-france.json';
import franceOutreMer from './france-outre-mer.json';

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
  sciences as RawDeck,
  sport as RawDeck,
  musique as RawDeck,
  cinema as RawDeck,
  litterature as RawDeck,
  egypteAntique as RawDeck,
  romeAntique as RawDeck,
  greceAntique as RawDeck,
  charlemagne as RawDeck,
  jeanneDarc as RawDeck,
  henriIv as RawDeck,
  louisXiv as RawDeck,
  revolutionFrancaise as RawDeck,
  napoleon as RawDeck,
  xixeSiecle as RawDeck,
  premiereGuerreMondiale as RawDeck,
  secondeGuerreMondiale as RawDeck,
  guerreFroide as RawDeck,
  cinquiemeRepublique as RawDeck,
  histoireAviation as RawDeck,
  conqueteSpatiale as RawDeck,
  univers as RawDeck,
  capitalesDuMonde as RawDeck,
  departementsFrancais as RawDeck,
  drapeauxDuMonde as RawDeck,
  fleuvesEtLacs as RawDeck,
  montagnesEtVolcans as RawDeck,
  oceansEtMers as RawDeck,
  desertsEtClimats as RawDeck,
  geographieAfrique as RawDeck,
  geographieAsie as RawDeck,
  geographieAmeriques as RawDeck,
  regionsDeFrance as RawDeck,
  franceOutreMer as RawDeck,
];
