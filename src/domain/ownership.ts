import type { Deck } from './types';

/** true si un deck free est actuellement offert (promo / événement). */
export function isTemporarilyFree(deck: Deck, now: number = Date.now()): boolean {
  return !!deck.freeUntil && new Date(deck.freeUntil).getTime() > now;
}

/**
 * true si le joueur peut jouer ce deck : gratuit, offert temporairement, ou
 * premium débloqué. `ownedDeckIds` = entitlements premium (source RevenueCat).
 */
export function isDeckAccessible(
  deck: Deck,
  ownedDeckIds: Iterable<string>,
  now: number = Date.now(),
): boolean {
  if (deck.tier === 'free' || isTemporarilyFree(deck, now)) return true;
  for (const id of ownedDeckIds) {
    if (id === deck.id) return true;
  }
  return false;
}
