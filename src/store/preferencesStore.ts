import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CategoryPreferences, PreferenceStrategy } from '@/domain/types';
import { defaultPreferences, PREFERENCES_VERSION } from '@/domain/preferences';
import { zustandStorage } from '@/services/storage';

interface PreferencesState {
  prefs: CategoryPreferences;
  hydrated: boolean;
  setStrategy: (strategy: PreferenceStrategy) => void;
  /** Coche / décoche une catégorie (à n'importe quel niveau). */
  toggle: (categoryId: string) => void;
  set: (categoryIds: string[]) => void;
  /** Revient à « toutes les catégories ». */
  reset: () => void;
  replace: (prefs: CategoryPreferences) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      prefs: defaultPreferences(),
      hydrated: false,

      setStrategy: (strategy) =>
        set({ prefs: { ...get().prefs, strategy, selected: [] } }),

      toggle: (categoryId) => {
        const { selected } = get().prefs;
        const next = selected.includes(categoryId)
          ? selected.filter((id) => id !== categoryId)
          : [...selected, categoryId];
        set({ prefs: { ...get().prefs, selected: next } });
      },

      set: (categoryIds) =>
        set({ prefs: { ...get().prefs, selected: [...new Set(categoryIds)] } }),

      reset: () => set({ prefs: defaultPreferences() }),

      replace: (prefs) => set({ prefs }),
    }),
    {
      name: 'gquizz.preferences',
      version: PREFERENCES_VERSION,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({ prefs: s.prefs }),
      onRehydrateStorage: () => () => {
        usePreferencesStore.setState({ hydrated: true });
      },
    },
  ),
);
