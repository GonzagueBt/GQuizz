import { View } from 'react-native';
import { router } from 'expo-router';

import { Button } from '@/components/Button';
import { CategorySelector } from '@/components/CategorySelector';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { CATEGORIES } from '@/data/categories';
import { useAppStore } from '@/store/appStore';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function OnboardingCategoriesScreen() {
  const prefs = usePreferencesStore((s) => s.prefs);
  const setSelected = usePreferencesStore((s) => s.set);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const include = prefs.strategy === 'include';
  const canContinue = !include || prefs.selected.length > 0;

  const finish = () => {
    completeOnboarding();
    router.replace('/');
  };

  return (
    <Screen scroll>
      <View style={{ gap: 6 }}>
        <Text variant="title">
          {include ? 'Que veux-tu avoir dans ton quiz ?' : 'Que veux-tu exclure de ton quiz ?'}
        </Text>
        <Text variant="caption" muted>
          {include
            ? 'Coche les catégories à inclure. Développe une catégorie pour affiner.'
            : 'Coche ce que tu ne veux pas voir. Tout le reste est inclus.'}
        </Text>
      </View>

      <CategorySelector
        categories={CATEGORIES}
        strategy={prefs.strategy}
        selected={prefs.selected}
        onChange={setSelected}
      />

      <Button
        label={canContinue ? 'Commencer à jouer' : 'Choisis au moins une catégorie'}
        disabled={!canContinue}
        onPress={finish}
      />
    </Screen>
  );
}
