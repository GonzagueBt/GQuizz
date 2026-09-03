import { Pressable, View } from 'react-native';
import { Stack } from 'expo-router';

import { Button } from '@/components/Button';
import { CategorySelector } from '@/components/CategorySelector';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { CATEGORIES } from '@/data/categories';
import { CATALOG } from '@/data/catalog';
import { CategoryTree } from '@/domain/categoryTree';
import { resolveAllowedCategoryIds } from '@/domain/preferences';
import { useTheme } from '@/hooks/useTheme';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function SettingsCategoriesScreen() {
  const prefs = usePreferencesStore((s) => s.prefs);
  const setStrategy = usePreferencesStore((s) => s.setStrategy);
  const setSelected = usePreferencesStore((s) => s.set);
  const reset = usePreferencesStore((s) => s.reset);
  const { colors, radius, spacing } = useTheme();

  const tree = new CategoryTree(CATALOG.categories);
  const allowed = resolveAllowedCategoryIds(prefs, tree);
  const matching = CATALOG.questions.filter((q) =>
    allowed.has(q.subcategoryId ?? q.categoryId),
  ).length;

  return (
    <Screen scroll>
      <Stack.Screen options={{ headerShown: true, title: 'Catégories du quiz' }} />

      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {(['include', 'exclude'] as const).map((s) => {
          const active = prefs.strategy === s;
          return (
            <Pressable
              key={s}
              onPress={() => setStrategy(s)}
              style={{
                flex: 1,
                padding: spacing.md,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: active ? colors.primary : colors.border,
                backgroundColor: active ? colors.primary : 'transparent',
              }}
            >
              <Text
                variant="label"
                color={active ? colors.primaryText : colors.text}
                style={{ textAlign: 'center' }}
              >
                {s === 'include' ? 'Ce que je veux' : 'Ce que je ne veux pas'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text variant="caption" muted>
        {matching} questions correspondent actuellement · pris en compte immédiatement.
      </Text>

      <CategorySelector
        categories={CATEGORIES}
        strategy={prefs.strategy}
        selected={prefs.selected}
        onChange={setSelected}
      />

      <Button label="Réinitialiser (toutes les catégories)" variant="ghost" onPress={reset} />
    </Screen>
  );
}
