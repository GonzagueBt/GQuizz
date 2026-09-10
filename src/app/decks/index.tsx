import { View } from 'react-native';
import { router } from 'expo-router';

import { BottomNav } from '@/components/BottomNav';
import { DeckCard } from '@/components/DeckCard';
import { Reveal } from '@/components/Reveal';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { CATALOG } from '@/data/catalog';
import { CategoryTree } from '@/domain/categoryTree';
import { isDeckAccessible } from '@/domain/ownership';
import type { Category, Deck } from '@/domain/types';
import { useTheme } from '@/hooks/useTheme';
import { useOwnershipStore } from '@/store/ownershipStore';

interface CategoryGroup {
  category: Category;
  decks: Deck[];
}

/** Regroupe des decks par catégorie de niveau 1, triées par `order`. */
function groupByCategory(decks: Deck[], tree: CategoryTree): CategoryGroup[] {
  const buckets = new Map<string, Deck[]>();
  for (const deck of decks) {
    const rootId = tree.path(deck.categoryId)[0]?.id ?? deck.categoryId;
    const list = buckets.get(rootId) ?? [];
    list.push(deck);
    buckets.set(rootId, list);
  }
  const groups: CategoryGroup[] = [];
  for (const [categoryId, list] of buckets) {
    const category = tree.get(categoryId);
    if (category) groups.push({ category, decks: list });
  }
  return groups.sort((a, b) => a.category.order - b.category.order);
}

export default function DecksScreen() {
  const ownedDeckIds = useOwnershipStore((s) => s.ownedDeckIds);
  const { colors, spacing } = useTheme();
  const tree = new CategoryTree(CATALOG.categories);
  const owns = (deckId: string) => {
    const deck = CATALOG.decks.find((d) => d.id === deckId);
    return deck ? isDeckAccessible(deck, ownedDeckIds) : false;
  };

  const mine = groupByCategory(
    CATALOG.decks.filter((d) => owns(d.id)),
    tree,
  );
  const toDiscover = groupByCategory(
    CATALOG.decks.filter((d) => !owns(d.id)),
    tree,
  );

  let revealIndex = 0;

  const renderGroups = (groups: CategoryGroup[], owned: boolean) =>
    groups.map(({ category, decks }) => (
      <View key={category.id} style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text variant="label">
            {category.emoji} {category.name.toUpperCase()}
          </Text>
          <Text variant="caption" muted>
            · {decks.length}
          </Text>
        </View>
        <View style={{ gap: 12 }}>
          {decks.map((deck) => (
            <Reveal key={deck.id} index={revealIndex++}>
              <DeckCard
                deck={deck}
                owned={owned}
                categoryLabel={deck.subcategoryId ? tree.get(deck.subcategoryId)?.name : undefined}
                onPress={() => router.push({ pathname: '/decks/[id]', params: { id: deck.id } })}
              />
            </Reveal>
          ))}
        </View>
      </View>
    ));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen scroll edges={['top']} contentStyle={{ gap: spacing.xl }}>
        <Reveal>
          <Text variant="title">📚 Decks</Text>
          <Text muted>Tous les thèmes disponibles, rangés par catégorie.</Text>
        </Reveal>

        {mine.length > 0 && (
          <View style={{ gap: spacing.lg }}>
            <Text variant="label" muted>
              MES DECKS
            </Text>
            <View style={{ gap: spacing.lg }}>{renderGroups(mine, true)}</View>
          </View>
        )}

        {toDiscover.length > 0 && (
          <View style={{ gap: spacing.lg }}>
            <Text variant="label" muted>
              À DÉCOUVRIR
            </Text>
            <View style={{ gap: spacing.lg }}>{renderGroups(toDiscover, false)}</View>
          </View>
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}
