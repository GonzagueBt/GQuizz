import type { SessionSummary } from './mastery';

/** Résumé persisté d'une partie jouée — alimente l'écran Progression. */
export interface SessionRecord {
  id: string;
  /** ISO date de fin de partie. */
  date: string;
  modeLabel: string;
  total: number;
  correct: number;
  score: number;
  /** Nombre de questions nouvellement maîtrisées pendant cette partie. */
  mastered: number;
}

/** Nombre de parties conservées dans l'historique (les plus anciennes sont purgées). */
export const MAX_HISTORY = 100;

export function buildSessionRecord(
  summary: SessionSummary,
  modeLabel: string,
  id: string,
  now: () => string = () => new Date().toISOString(),
): SessionRecord {
  return {
    id,
    date: now(),
    modeLabel,
    total: summary.total,
    correct: summary.correct,
    score: summary.score,
    mastered: summary.newlyMastered.length,
  };
}

/** Ajoute un enregistrement, en conservant au plus `max` parties (les plus récentes). */
export function appendHistory(
  history: SessionRecord[],
  record: SessionRecord,
  max: number = MAX_HISTORY,
): SessionRecord[] {
  const next = [...history, record];
  return next.length > max ? next.slice(next.length - max) : next;
}

/** Précision globale (%) sur tout l'historique. 0 si aucune partie jouée. */
export function overallAccuracy(history: SessionRecord[]): number {
  const total = history.reduce((sum, r) => sum + r.total, 0);
  if (total === 0) return 0;
  const correct = history.reduce((sum, r) => sum + r.correct, 0);
  return Math.round((correct / total) * 100);
}

/** Total de questions maîtrisées, cumulé partie après partie (ordre de l'historique). */
export function cumulativeMastered(history: SessionRecord[]): number[] {
  let running = 0;
  return history.map((r) => (running += r.mastered));
}
