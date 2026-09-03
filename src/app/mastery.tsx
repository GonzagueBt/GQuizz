import { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';

import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { CATALOG } from '@/data/catalog';
import { CategoryTree } from '@/domain/categoryTree';
import { isDeckAccessible } from '@/domain/ownership';
import type { Deck, Question } from '@/domain/types';
import { useTheme } from '@/hooks/useTheme';
import { useOwnershipStore } from '@/store/ownershipStore';
import { useProgressStore } from '@/store/progressStore';

type Tab = 'mastered' | 'todo';

export default function MasteryScreen() {
  const progress = useProgressStore((s) => s.progress);
  const setMastered = useProgressStore((s) => s.setMastered);
  const ownedDeckIds = useOwnershipStore((s) => s.ownedDeckIds);
  const { colors, spacing } = useTheme();

  const [tab, setTab] = useState<Tab>('mastered');
  const [deckFilter, setDeckFilter] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const tree = useMemo(() => new CategoryTree(CATALOG.categories), []);
  const deckById = useMemo(
    () => new Map<string, Deck>(CATALOG.decks.map((d) => [d.id, d])),
    [],
  );

  const ownedDecks = useMemo(
    () => CATALOG.decks.filter((d) => isDeckAccessible(d, ownedDeckIds)),
    [ownedDeckIds],
  );

  const isMastered = (id: string) => !!progress[id]?.masteredAt;

  const masteredCount = useMemo(
    () => Object.values(progress).filter((p) => p.masteredAt).length,
    [progress],
  );
  const availableCount = useMemo(
    () =>
      CATALOG.questions.filter((q) => {
        const d = deckById.get(q.deckId);
        return d ? isDeckAccessible(d, ownedDeckIds) : false;
      }).length,
    [deckById, ownedDeckIds],
  );

  const rows = useMemo(() => {
    return CATALOG.questions.filter((q) => {
      if (deckFilter && q.deckId !== deckFilter) return false;
      const mastered = !!progress[q.id]?.masteredAt;
      if (tab === 'mastered') return mastered;
      // « à maîtriser » : questions jouables non encore maîtrisées
      const d = deckById.get(q.deckId);
      return !mastered && !!d && isDeckAccessible(d, ownedDeckIds);
    });
  }, [tab, deckFilter, progress, deckById, ownedDeckIds]);

  const categoryLabel = (q: Question) => {
    const path = tree.path(q.subcategoryId ?? q.categoryId);
    return path.map((c) => c.name).join(' › ');
  };

  return (
    <Screen contentStyle={{ padding: 0, gap: 0 }}>
      <Stack.Screen options={{ headerShown: true, title: 'Questions maîtrisées' }} />

      <FlatList
        data={rows}
        keyExtractor={(q) => q.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        ListHeaderComponent={
          <View style={{ gap: spacing.md, marginBottom: spacing.sm }}>
            <View>
              <Text variant="title">{masteredCount}</Text>
              <Text muted>
                question{masteredCount > 1 ? 's' : ''} maîtrisée{masteredCount > 1 ? 's' : ''} ·{' '}
                {availableCount} jouables
              </Text>
              <Text variant="caption" muted style={{ marginTop: 4 }}>
                Une question devient maîtrisée après 3 bonnes réponses d&apos;affilée. Tu peux aussi
                l&apos;ajuster ici à la main.
              </Text>
            </View>

            <View style={styles.segment}>
              {(['mastered', 'todo'] as const).map((t) => {
                const active = tab === t;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTab(t)}
                    style={[
                      styles.segmentItem,
                      {
                        backgroundColor: active ? colors.primary : colors.surfaceAlt,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      variant="label"
                      color={active ? colors.primaryText : colors.text}
                      style={{ textAlign: 'center' }}
                    >
                      {t === 'mastered' ? 'Maîtrisées' : 'À maîtriser'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.xs, paddingVertical: 2 }}
            >
              <FilterChip
                label="Tous les decks"
                active={deckFilter === null}
                onPress={() => setDeckFilter(null)}
              />
              {ownedDecks.map((d) => (
                <FilterChip
                  key={d.id}
                  label={`${d.emoji} ${d.name}`}
                  active={deckFilter === d.id}
                  onPress={() => setDeckFilter(d.id)}
                />
              ))}
            </ScrollView>
          </View>
        }
        ListEmptyComponent={
          <Card>
            <Text muted>
              {tab === 'mastered'
                ? 'Aucune question maîtrisée pour ce filtre. Enchaîne les bonnes réponses en partie, ou passe sur « À maîtriser » pour en cocher.'
                : 'Rien à maîtriser ici — tout est déjà validé pour ce filtre. 🎉'}
            </Text>
          </Card>
        }
        renderItem={({ item: q }) => {
          const mastered = isMastered(q.id);
          const open = expanded === q.id;
          const correct = q.answers.filter((a) => a.correct).map((a) => a.text).join(', ');
          return (
            <Card>
              <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
                <Pressable
                  style={{ flex: 1, gap: 2 }}
                  onPress={() => setExpanded(open ? null : q.id)}
                >
                  <Text variant="label" numberOfLines={open ? undefined : 2}>
                    {q.prompt}
                  </Text>
                  <Text variant="caption" muted>
                    {deckById.get(q.deckId)?.emoji} {categoryLabel(q)}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setMastered(q.id, !mastered)}
                  hitSlop={10}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: mastered }}
                  accessibilityLabel={
                    mastered ? 'Retirer des maîtrisées' : 'Marquer comme maîtrisée'
                  }
                  style={[
                    styles.toggle,
                    {
                      backgroundColor: mastered ? colors.success : 'transparent',
                      borderColor: mastered ? colors.success : colors.border,
                    },
                  ]}
                >
                  <Text color={mastered ? colors.primaryText : colors.textMuted} style={styles.toggleMark}>
                    {mastered ? '✓' : '+'}
                  </Text>
                </Pressable>
              </View>

              {open && (
                <View style={{ marginTop: spacing.sm, gap: 4 }}>
                  <Text variant="caption" color={colors.success}>
                    Réponse : {correct}
                  </Text>
                  {q.explanation ? (
                    <Text variant="caption" muted>
                      {q.explanation}
                    </Text>
                  ) : null}
                </View>
              )}
            </Card>
          );
        }}
      />
    </Screen>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.primary : 'transparent',
      }}
    >
      <Text variant="caption" color={active ? colors.primaryText : colors.text}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: 'row', gap: 8 },
  segmentItem: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  toggle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleMark: { fontSize: 16, fontWeight: '800', lineHeight: 20 },
});
