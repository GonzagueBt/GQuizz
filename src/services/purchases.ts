import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import type { Deck } from '@/domain/types';

export type PurchaseResult =
  | { ok: true }
  | { ok: false; reason: 'cancelled' | 'error' | 'not-purchasable' };

/**
 * Contrat d'accès aux achats. Une seule implémentation active à la fois.
 * Voir ARCHITECTURE.md §4 et ../MOBILE_PROJECT_ARCHITECTURE.md.
 */
export interface PurchasesService {
  /** À appeler une fois au démarrage. */
  init(): Promise<void>;
  /** Ids de decks premium débloqués pour le compte courant. */
  getOwnedDeckIds(): Promise<string[]>;
  /** Lance le tunnel d'achat natif pour un deck. */
  purchaseDeck(deck: Deck): Promise<PurchaseResult>;
  /** « Restaurer mes achats » (obligatoire review Apple). Retourne les ids restaurés. */
  restore(): Promise<string[]>;
}

const STUB_KEY = 'gquizz.stub.purchases';

/**
 * Implémentation de dev : « achète » sans passer par un store, persiste en local.
 * Activée quand `EXPO_PUBLIC_PURCHASES_STUB=1` ou hors build de production.
 */
class StubPurchases implements PurchasesService {
  async init() {}

  async getOwnedDeckIds() {
    const raw = await AsyncStorage.getItem(STUB_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  }

  async purchaseDeck(deck: Deck): Promise<PurchaseResult> {
    if (deck.tier !== 'premium') return { ok: false, reason: 'not-purchasable' };
    const owned = new Set(await this.getOwnedDeckIds());
    owned.add(deck.id);
    await AsyncStorage.setItem(STUB_KEY, JSON.stringify([...owned]));
    return { ok: true };
  }

  async restore() {
    return this.getOwnedDeckIds();
  }
}

/**
 * Implémentation RevenueCat — à activer quand `react-native-purchases` est installé
 * et qu'un dev client / build EAS est utilisé (ne fonctionne pas dans Expo Go).
 *
 *   import Purchases, { LOG_LEVEL } from 'react-native-purchases';
 *
 *   async init() {
 *     Purchases.setLogLevel(LOG_LEVEL.WARN);
 *     Purchases.configure({ apiKey: Platform.select({ ios: IOS_KEY, android: ANDROID_KEY })! });
 *   }
 *   async getOwnedDeckIds() {
 *     const info = await Purchases.getCustomerInfo();
 *     return Object.keys(info.entitlements.active)
 *       .filter((e) => e.startsWith('deck_'))
 *       .map((e) => e.replace('deck_', ''));
 *   }
 *   async purchaseDeck(deck) {
 *     try {
 *       const offerings = await Purchases.getOfferings();
 *       const pkg = offerings.all[deck.id]?.availablePackages[0];
 *       if (!pkg) return { ok: false, reason: 'not-purchasable' };
 *       await Purchases.purchasePackage(pkg);
 *       return { ok: true };
 *     } catch (e: any) {
 *       return { ok: false, reason: e?.userCancelled ? 'cancelled' : 'error' };
 *     }
 *   }
 *   async restore() {
 *     const info = await Purchases.restorePurchases();
 *     return Object.keys(info.entitlements.active).map((e) => e.replace('deck_', ''));
 *   }
 */

function stubEnabled(): boolean {
  if (process.env.EXPO_PUBLIC_PURCHASES_STUB === '1') return true;
  const extra = Constants.expoConfig?.extra as { purchasesStub?: boolean } | undefined;
  if (extra?.purchasesStub) return true;
  return __DEV__;
}

let instance: PurchasesService | null = null;

export function getPurchases(): PurchasesService {
  if (!instance) {
    // Scaffold : toujours le stub tant que `react-native-purchases` n'est pas installé.
    instance = stubEnabled() ? new StubPurchases() : new StubPurchases();
  }
  return instance;
}
