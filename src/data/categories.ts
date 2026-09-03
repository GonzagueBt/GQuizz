import type { Category } from '@/domain/types';

/**
 * Arbre de catégories, stocké à plat (`parentId`).
 * L'UI n'affiche que 2 niveaux mais le modèle en autorise davantage.
 * Convention d'id : sous-catégorie préfixée par le parent ("sport.football").
 * Le code ne s'appuie que sur `parentId`.
 */
export const CATEGORIES: Category[] = [
  // --- Niveau 1 -----------------------------------------------------------
  { id: 'histoire', parentId: null, name: 'Histoire', emoji: '🏛️', order: 10 },
  { id: 'geographie', parentId: null, name: 'Géographie', emoji: '🗺️', order: 20 },
  { id: 'sciences', parentId: null, name: 'Sciences', emoji: '🔬', order: 30 },
  { id: 'espace', parentId: null, name: 'Espace', emoji: '🚀', order: 40 },
  { id: 'sport', parentId: null, name: 'Sport', emoji: '⚽', order: 50 },
  { id: 'musique', parentId: null, name: 'Musique', emoji: '🎵', order: 60 },
  { id: 'cinema', parentId: null, name: 'Cinéma', emoji: '🎬', order: 70 },
  { id: 'litterature', parentId: null, name: 'Littérature', emoji: '📚', order: 80 },
  { id: 'aeronautique', parentId: null, name: 'Aéronautique', emoji: '✈️', order: 90 },
  { id: 'militaire', parentId: null, name: 'Militaire', emoji: '🎖️', order: 100 },
  { id: 'marine', parentId: null, name: 'Marine', emoji: '⚓', order: 110 },
  { id: 'montagne', parentId: null, name: 'Montagne', emoji: '🏔️', order: 120 },

  // --- Histoire ---------------------------------------------------------
  { id: 'histoire.france', parentId: 'histoire', name: 'Histoire de France', emoji: '🇫🇷', order: 10 },
  { id: 'histoire.antiquite', parentId: 'histoire', name: 'Antiquité', emoji: '🏺', order: 20 },
  { id: 'histoire.xxe', parentId: 'histoire', name: 'XXe siècle', emoji: '📻', order: 30 },

  // --- Géographie -----------------------------------------------------
  { id: 'geographie.monde', parentId: 'geographie', name: 'Pays & capitales', emoji: '🌍', order: 10 },
  { id: 'geographie.physique', parentId: 'geographie', name: 'Géographie physique', emoji: '⛰️', order: 20 },

  // --- Sciences ------------------------------------------------------
  { id: 'sciences.physique', parentId: 'sciences', name: 'Physique', emoji: '⚛️', order: 10 },
  { id: 'sciences.bio', parentId: 'sciences', name: 'Biologie', emoji: '🧬', order: 20 },
  { id: 'sciences.maths', parentId: 'sciences', name: 'Mathématiques', emoji: '➗', order: 30 },

  // --- Espace -------------------------------------------------------
  { id: 'espace.systeme-solaire', parentId: 'espace', name: 'Système solaire', emoji: '🪐', order: 10 },
  { id: 'espace.conquete', parentId: 'espace', name: 'Conquête spatiale', emoji: '👨‍🚀', order: 20 },

  // --- Sport -------------------------------------------------------
  { id: 'sport.football', parentId: 'sport', name: 'Football', emoji: '⚽', order: 10 },
  { id: 'sport.tennis', parentId: 'sport', name: 'Tennis', emoji: '🎾', order: 20 },
  { id: 'sport.rugby', parentId: 'sport', name: 'Rugby', emoji: '🏉', order: 30 },
  { id: 'sport.basketball', parentId: 'sport', name: 'Basketball', emoji: '🏀', order: 40 },
  { id: 'sport.cyclisme', parentId: 'sport', name: 'Cyclisme', emoji: '🚴', order: 50 },
  { id: 'sport.f1', parentId: 'sport', name: 'Formule 1', emoji: '🏎️', order: 60 },
  { id: 'sport.ski', parentId: 'sport', name: 'Ski', emoji: '🎿', order: 70 },

  // --- Musique ----------------------------------------------------
  { id: 'musique.classique', parentId: 'musique', name: 'Classique', emoji: '🎻', order: 10 },
  { id: 'musique.rock', parentId: 'musique', name: 'Rock', emoji: '🎸', order: 20 },
  { id: 'musique.chanson-fr', parentId: 'musique', name: 'Chanson française', emoji: '🎤', order: 30 },

  // --- Aéronautique ---------------------------------------------
  { id: 'aeronautique.histoire', parentId: 'aeronautique', name: "Histoire de l'aviation", emoji: '🛩️', order: 10 },
  { id: 'aeronautique.avions', parentId: 'aeronautique', name: 'Avions civils & militaires', emoji: '🛫', order: 20 },
];
