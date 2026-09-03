import { useAppStore } from '@/store/appStore';
import { useOwnershipStore } from '@/store/ownershipStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useProgressStore } from '@/store/progressStore';

/** true quand tous les stores persistés ont fini de se réhydrater. */
export function useHydrated(): boolean {
  const app = useAppStore((s) => s.hydrated);
  const prefs = usePreferencesStore((s) => s.hydrated);
  const ownership = useOwnershipStore((s) => s.hydrated);
  const progress = useProgressStore((s) => s.hydrated);
  return app && prefs && ownership && progress;
}
