import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AnswerOutcome, ProgressMap, SessionSummary } from '@/domain/mastery';
import { isMastered, setMastery, summarizeSession } from '@/domain/mastery';
import { zustandStorage } from '@/services/storage';

interface ProgressState {
  progress: ProgressMap;
  totalScore: number;
  gamesPlayed: number;
  hydrated: boolean;
  /** Applique les réponses d'une partie et retourne le résumé. */
  applySession: (outcomes: AnswerOutcome[]) => SessionSummary;
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
      hydrated: false,

      applySession: (outcomes) => {
        const { summary, progress } = summarizeSession(outcomes, get().progress);
        set({
          progress,
          totalScore: get().totalScore + summary.score,
          gamesPlayed: get().gamesPlayed + 1,
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

      reset: () => set({ progress: {}, totalScore: 0, gamesPlayed: 0 }),
    }),
    {
      name: 'gquizz.progress',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({
        progress: s.progress,
        totalScore: s.totalScore,
        gamesPlayed: s.gamesPlayed,
      }),
      onRehydrateStorage: () => () => {
        useProgressStore.setState({ hydrated: true });
      },
    },
  ),
);
