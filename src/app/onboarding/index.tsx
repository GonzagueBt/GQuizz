import { View } from 'react-native';
import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import type { PreferenceStrategy } from '@/domain/types';
import { useAppStore } from '@/store/appStore';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function WelcomeScreen() {
  const setStrategy = usePreferencesStore((s) => s.setStrategy);
  const resetPrefs = usePreferencesStore((s) => s.reset);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const goCustomize = (strategy: PreferenceStrategy) => {
    setStrategy(strategy);
    router.push('/onboarding/categories');
  };

  const takeAll = () => {
    resetPrefs();
    completeOnboarding();
    router.replace('/');
  };

  return (
    <Screen scroll contentStyle={{ justifyContent: 'center' }}>
      <View style={{ gap: 8 }}>
        <Text variant="title">Bienvenue dans GQuizz</Text>
        <Text muted>
          Des centaines de questions de culture générale, organisées en decks. Réponds, progresse,
          maîtrise.
        </Text>
      </View>

      <Text variant="label" style={{ marginTop: 12 }}>
        Comment veux-tu jouer ?
      </Text>

      <View style={{ gap: 12 }}>
        <Button
          label="🌎  Je choisis ce que je veux"
          onPress={() => goCustomize('include')}
        />
        <Button
          label="🚫  Je choisis ce que je ne veux pas"
          variant="secondary"
          onPress={() => goCustomize('exclude')}
        />
        <Button label="✨  Tout me va" variant="ghost" onPress={takeAll} />
      </View>

      <Text variant="caption" muted style={{ textAlign: 'center', marginTop: 8 }}>
        Tu pourras tout changer plus tard dans Réglages → Catégories du quiz.
      </Text>
    </Screen>
  );
}
