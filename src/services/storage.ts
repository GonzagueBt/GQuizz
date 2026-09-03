import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

/**
 * Persistance locale. Scaffold : AsyncStorage partout (compatible Expo Go + web).
 * Production : remplacer par `react-native-mmkv` sur natif (voir
 * ../MOBILE_PROJECT_ARCHITECTURE.md), en gardant cette interface.
 */
export const zustandStorage: StateStorage = {
  getItem: (name) => AsyncStorage.getItem(name),
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};

/** Version du schéma de persistance — incrémenter en cas de migration. */
export const STORAGE_VERSION = 1;

export async function wipeLocalData(): Promise<void> {
  await AsyncStorage.clear();
}
