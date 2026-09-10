import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AnswerOutcome, ProgressMap, SessionSummary } from '@/domain/mastery';
import { isMastered, setMastery, summarizeSession } from '@/domain/mastery';
import { appendHistory, buildSessionRecord, type SessionRecord } from '@/domain/stats';
import { zustandStorage } from '@/services/storage';

function newHistoryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface ProgressState {
  progress: ProgressMap;
  totalScore: number;
  gamesPlayed: number;
  /** Une entrée par partie jouée, la plus récente en dernier — alimente l'écran Progression. */
  history: SessionRecord[];
  hydrated: boolean;
  /** Applique les réponses d'une partie et retourne le résumé. */
  applySession: (outcomes: AnswerOutcome[], modeLabel: string) => SessionSummary;
  masteredCount: () => number;
  isMastered: (questionId: string) => boolean;
  /** Marque / démarque manuellement une question (écran « Questions maîtrisées »). */
  setMastered: (questionId: string, mastered: boolean) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: {},
      totalScore: 0,
      gamesPlayed: 0,
      history: [],
      hydrated: false,

      applySession: (outcomes, modeLabel) => {
        const { summary, progress } = summarizeSession(outcomes, get().progress);
        const record = buildSessionRecord(summary, modeLabel, newHistoryId());
        set({
          progress,
          totalScore: get().totalScore + summary.score,
          gamesPlayed: get().gamesPlayed + 1,
          history: appendHistory(get().history, record),
        });
        return summary;
      },

      masteredCount: () =>
        Object.values(get().progress).filter((p) => p.masteredAt).length,

      isMastered: (questionId) => isMastered(get().progress[questionId]),

      setMastered: (questionId, mastered) =>
        set((s) => ({
          progress: {
            ...s.progress,
            [questionId]: setMastery(s.progress[questionId], questionId, mastered),
          },
        })),

      reset: () => set({ progress: {}, totalScore: 0, gamesPlayed: 0, history: [] }),
    }),
    {
      name: 'gquizz.progress',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({
        progress: s.progress,
        totalScore: s.totalScore,
        gamesPlayed: s.gamesPlayed,
        history: s.history,
      }),
      onRehydrateStorage: () => () => {
        useProgressStore.setState({ hydrated: true });
      },
    },
  ),
);
