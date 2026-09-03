import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { CATALOG } from '@/data/catalog';
import { isDeckAccessible } from '@/domain/ownership';
import type { Deck } from '@/domain/types';
import { getPurchases, type PurchaseResult } from '@/services/purchases';
import { zustandStorage } from '@/services/storage';

interface OwnershipState {
  ownedDeckIds: string[];
  syncing: boolean;
  hydrated: boolean;
  /** Recharge la possession depuis la source de vérité (RevenueCat / stub). */
  sync: () => Promise<void>;
  purchase: (deck: Deck) => Promise<PurchaseResult>;
  restore: () => Promise<void>;
  /** free (ou promo) => toujours possédé ; premium => selon les entitlements. */
  isDeckOwned: (deckId: string) => boolean;
}

export const useOwnershipStore = create<OwnershipState>()(
  persist(
    (set, get) => ({
      ownedDeckIds: [],
      syncing: false,
      hydrated: false,

      sync: async () => {
        set({ syncing: true });
        try {
          await getPurchases().init();
          const ids = await getPurchases().getOwnedDeckIds();
          set({ ownedDeckIds: ids });
        } finally {
          set({ syncing: false });
        }
      },

      purchase: async (deck) => {
        const result = await getPurchases().purchaseDeck(deck);
        if (result.ok) await get().sync();
        return result;
      },

      restore: async () => {
        const ids = await getPurchases().restore();
        set({ ownedDeckIds: ids });
      },

      isDeckOwned: (deckId) => {
        const deck = CATALOG.decks.find((d) => d.id === deckId);
        return deck ? isDeckAccessible(deck, get().ownedDeckIds) : false;
      },
    }),
    {
      name: 'gquizz.ownership',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (s) => ({ ownedDeckIds: s.ownedDeckIds }),
      onRehydrateStorage: () => () => {
        useOwnershipStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Version non-hook pour la logique métier (buildQuestionPool hors composant). */
export function isDeckOwned(deckId: string): boolean {
  return useOwnershipStore.getState().isDeckOwned(deckId);
}
