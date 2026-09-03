import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@/services/storage';

interface AppState {
  onboardingDone: boolean;
  hydrated: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingDone: false,
      hydrated: false,
      completeOnboarding: () => set({ onboardingDone: true }),
      resetOnboarding: () => set({ onboardingDone: false }),
    }),
    {
      name: 'gquizz.app',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({ onboardingDone: s.onboardingDone }),
      onRehydrateStorage: () => () => {
        useAppStore.setState({ hydrated: true });
      },
    },
  ),
);
