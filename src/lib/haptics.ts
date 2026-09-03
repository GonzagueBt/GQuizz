import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** Retour haptique tolérant (no-op sur web / si indisponible). */
export function feedback(correct: boolean): void {
  if (Platform.OS === 'web') return;
  try {
    Haptics.notificationAsync(
      correct
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    );
  } catch {
    // ignore
  }
}
