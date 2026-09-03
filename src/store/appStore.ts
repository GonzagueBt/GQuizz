import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/services/storage';

interface AppState {
  onboardingDone: boolean;
  /** Quand la réponse est juste, passer seul à la question suivante après une
   *  courte pause (voir CONFIG.AUTO_ADVANCE_DELAY_MS). Sur une mauvaise réponse
   *  on reste toujours sur la question. */
  autoAdvanceOnCorrect: boolean;
  hydrated: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  setAutoAdvanceOnCorrect: (value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingDone: false,
      autoAdvanceOnCorrect: true,
      hydrated: false,
      completeOnboarding: () => set({ onboardingDone: true }),
      resetOnboarding: () => set({ onboardingDone: false }),
      setAutoAdvanceOnCorrect: (autoAdvanceOnCorrect) => set({ autoAdvanceOnCorrect }),
    }),
    {
      name: 'gquizz.app',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({
        onboardingDone: s.onboardingDone,
        autoAdvanceOnCorrect: s.autoAdvanceOnCorrect,
      }),
      onRehydrateStorage: () => () => {
        useAppStore.setState({ hydrated: true });
      },
    },
  ),
);
