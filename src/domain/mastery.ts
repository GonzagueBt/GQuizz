import { CONFIG } from '@/data/config';
import type { Question, QuestionProgress } from './types';

export type ProgressMap = Record<string, QuestionProgress>;

export function isMastered(p: QuestionProgress | undefined): boolean {
  return !!p?.masteredAt;
}

/** Poids de tirage : jamais vues > vues non maîtrisées > maîtrisées (rappel espacé léger). */
function samplingWeight(p: QuestionProgress | undefined): number {
  if (!p || p.seen === 0) return 6;
  if (!p.masteredAt) return 3;
  return 1;
}

/**
 * Sélectionne les questions d'une session à partir d'un pool.
 * `rng` injectable pour des tests déterministes (défaut: Math.random).
 */
export function pickSession(
  pool: Question[],
  progress: ProgressMap,
  count: number = CONFIG.SESSION_LENGTH,
  rng: () => number = Math.random,
): Question[] {
  const remaining = [...pool];
  const picked: Question[] = [];
  const target = Math.min(count, remaining.length);

  while (picked.length < target && remaining.length > 0) {
    const weights = remaining.map((q) => samplingWeight(progress[q.id]));
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rng() * total;
    let idx = 0;
    while (idx < weights.length - 1 && r >= weights[idx]) {
      r -= weights[idx];
      idx += 1;
    }
    picked.push(remaining.splice(idx, 1)[0]);
  }
  return picked;
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
