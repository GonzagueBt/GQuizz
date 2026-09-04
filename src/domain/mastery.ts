import { CONFIG } from '@/data/config';
import type { Question, QuestionProgress } from './types';

export type ProgressMap = Record<string, QuestionProgress>;

export function isMastered(p: QuestionProgress | undefined): boolean {
  return !!p?.masteredAt;
}

/**
 * Marque / démarque manuellement une question comme maîtrisée (écran dédié).
 * Marquer : pose `masteredAt` et remonte le streak au seuil.
 * Démarquer : efface `masteredAt` et remet le streak à zéro (l'historique
 * `seen` / `correct` est conservé).
 */
export function setMastery(
  prev: QuestionProgress | undefined,
  questionId: string,
  mastered: boolean,
  now: () => string = () => new Date().toISOString(),
): QuestionProgress {
  const base: QuestionProgress = prev ?? { questionId, seen: 0, correct: 0, streak: 0 };
  if (mastered) {
    return {
      ...base,
      masteredAt: base.masteredAt ?? now(),
      streak: Math.max(base.streak, CONFIG.MASTERY_STREAK),
    };
  }
  const next = { ...base, streak: 0 };
  delete next.masteredAt;
  return next;
}

/**
 * Ordonne une partie : TOUTES les questions du pool, mélangées — aucune
 * troncature. La partie s'arrête d'elle-même quand les vies sont épuisées
 * (voir CONFIG.STARTING_LIVES) ou quand le pool est entièrement parcouru.
 * `rng` injectable pour des tests déterministes (défaut : Math.random).
 */
export function shuffleQuestions(pool: Question[], rng: () => number = Math.random): Question[] {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface AnswerOutcome {
  questionId: string;
  correct: boolean;
  difficulty: number;
}

/** Points gagnés pour une bonne réponse, en tenant compte du streak courant. */
export function scoreForAnswer(outcome: AnswerOutcome, streakBefore: number): number {
  if (!outcome.correct) return 0;
  return (
    CONFIG.SCORE_BASE +
    CONFIG.SCORE_DIFFICULTY_BONUS * (outcome.difficulty - 1) +
    CONFIG.SCORE_STREAK_BONUS * streakBefore
  );
}

/** Retourne la progression mise à jour pour une question (immutable). */
export function applyOutcome(
  prev: QuestionProgress | undefined,
  outcome: AnswerOutcome,
  now: () => string = () => new Date().toISOString(),
): QuestionProgress {
  const base: QuestionProgress = prev ?? {
    questionId: outcome.questionId,
    seen: 0,
    correct: 0,
    streak: 0,
  };

  const streak = outcome.correct ? base.streak + 1 : 0;
  const next: QuestionProgress = {
    ...base,
    seen: base.seen + 1,
    correct: base.correct + (outcome.correct ? 1 : 0),
    streak,
  };

  if (!next.masteredAt && streak >= CONFIG.MASTERY_STREAK) {
    next.masteredAt = now();
  }
  return next;
}

export interface SessionSummary {
  total: number;
  correct: number;
  score: number;
  newlyMastered: string[];
}

/** Rejoue une session complète pour produire le résumé + les progrès à persister. */
export function summarizeSession(
  outcomes: AnswerOutcome[],
  progress: ProgressMap,
  now: () => string = () => new Date().toISOString(),
): { summary: SessionSummary; progress: ProgressMap } {
  let score = 0;
  let correct = 0;
  const newlyMastered: string[] = [];
  const next: ProgressMap = { ...progress };

  for (const outcome of outcomes) {
    const before = next[outcome.questionId];
    const wasMastered = isMastered(before);
    score += scoreForAnswer(outcome, before?.streak ?? 0);
    if (outcome.correct) correct += 1;

    const updated = applyOutcome(before, outcome, now);
    next[outcome.questionId] = updated;
    if (!wasMastered && isMastered(updated)) newlyMastered.push(outcome.questionId);
  }

  return {
    summary: { total: outcomes.length, correct, score, newlyMastered },
    progress: next,
  };
}
