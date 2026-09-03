import { Switch, View } from 'react-native';
import Constants from 'expo-constants';
import { router, Stack } from 'expo-router';

import { Card } from '@/components/Card';
import { useConfirm } from '@/components/ConfirmProvider';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';
import { useOwnershipStore } from '@/store/ownershipStore';
import { useProgressStore } from '@/store/progressStore';

export default function SettingsScreen() {
  const restore = useOwnershipStore((s) => s.restore);
  const resetProgress = useProgressStore((s) => s.reset);
  const resetOnboarding = useAppStore((s) => s.resetOnboarding);
  const autoAdvance = useAppStore((s) => s.autoAdvanceOnCorrect);
  const setAutoAdvance = useAppStore((s) => s.setAutoAdvanceOnCorrect);
  const confirm = useConfirm();
  const { colors } = useTheme();

  const confirmResetProgress = async () => {
    const ok = await confirm({
      title: 'Réinitialiser la progression ?',
      message: 'Score et questions maîtrisées seront effacés.',
      confirmLabel: 'Réinitialiser',
      destructive: true,
    });
    if (ok) resetProgress();
  };

  const redoIntro = () => {
    resetOnboarding();
    router.replace('/onboarding');
  };

  return (
    <Screen scroll>
      <Stack.Screen options={{ headerShown: true, title: '⚙️ Réglages' }} />

      <Text variant="label" muted>
        QUIZ
      </Text>
      <Card onPress={() => router.push('/settings/categories')}>
        <Text variant="heading">Catégories du quiz</Text>
        <Text variant="caption" muted>
          Choisis ce qui apparaît en mode Global personnalisé.
        </Text>
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="heading">Passer automatiquement</Text>
            <Text variant="caption" muted>
              Quand ta réponse est juste, on file à la question suivante après une courte pause.
              Sur une mauvaise réponse, on reste pour voir la bonne.
            </Text>
          </View>
          <Switch
            value={autoAdvance}
            onValueChange={setAutoAdvance}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
            accessibilityLabel="Passer automatiquement à la question suivante"
          />
        </View>
      </Card>

      <Text variant="label" muted style={{ marginTop: 12 }}>
        ACHATS
      </Text>
      <Card onPress={() => restore()}>
        <Text variant="heading">Restaurer mes achats</Text>
        <Text variant="caption" muted>
          Récupère les decks déjà achetés avec ce compte.
        </Text>
      </Card>

      <Text variant="label" muted style={{ marginTop: 12 }}>
        DONNÉES
      </Text>
      <Card onPress={() => void confirmResetProgress()}>
        <Text variant="heading">Réinitialiser ma progression</Text>
      </Card>
      <Card onPress={redoIntro}>
        <Text variant="heading">Refaire l&apos;introduction</Text>
      </Card>

      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <Text variant="caption" muted>
          GQuizz v{Constants.expoConfig?.version ?? '0.1.0'}
        </Text>
      </View>
    </Screen>
  );
}
