import { View } from 'react-native';
import { Redirect, router } from 'expo-router';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { CATALOG } from '@/data/catalog';
import { gameModeToParam } from '@/domain/gameMode';
import { isDeckAccessible } from '@/domain/ownership';
import { buildQuestionPool } from '@/domain/questionPool';
import { useTheme } from '@/hooks/useTheme';
import { useAppStore } from '@/store/appStore';
import { useOwnershipStore } from '@/store/ownershipStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useProgressStore } from '@/store/progressStore';

export default function HomeScreen() {
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const prefs = usePreferencesStore((s) => s.prefs);
  const ownedDeckIds = useOwnershipStore((s) => s.ownedDeckIds);
  const totalScore = useProgressStore((s) => s.totalScore);
  const masteredCount = useProgressStore((s) => s.masteredCount());
  const { colors, spacing } = useTheme();

  // Recalculs légers (quelques dizaines de questions, <10 decks).
  const isDeckOwned = (deckId: string) => {
    const deck = CATALOG.decks.find((d) => d.id === deckId);
    return deck ? isDeckAccessible(deck, ownedDeckIds) : false;
  };

  let globalPoolSize = 0;
  try {
    globalPoolSize = buildQuestionPool({
      mode: { kind: 'global' },
      questions: CATALOG.questions,
      categories: CATALOG.categories,
      prefs,
      isDeckOwned,
    }).length;
  } catch {
    globalPoolSize = 0;
  }

  const playableDecks = CATALOG.decks.filter((d) => isDeckOwned(d.id));

  if (!onboardingDone) return <Redirect href="/onboarding" />;

  const openPlay = (param: string) =>
    router.push({ pathname: '/play/[mode]', params: { mode: param } });

  return (
    <Screen scroll>
      <View style={{ gap: 4 }}>
        <Text variant="title">GQuizz</Text>
        <Text muted>Teste ta culture générale.</Text>
      </View>

      <Card style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <View style={{ alignItems: 'center' }}>
          <Text variant="heading">{totalScore}</Text>
          <Text variant="caption" muted>
            Score total
          </Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text variant="heading">{masteredCount}</Text>
          <Text variant="caption" muted>
            Questions maîtrisées
          </Text>
        </View>
      </Card>

      <Text variant="label" muted>
        JOUER
      </Text>

      <Card onPress={() => openPlay(gameModeToParam({ kind: 'global' }))}>
        <Text variant="heading">🌎 Global personnalisé</Text>
        <Text variant="caption" muted>
          {globalPoolSize > 0
            ? `${globalPoolSize} questions dans tes catégories`
            : 'Aucune question — élargis tes catégories dans les réglages'}
        </Text>
      </Card>

      {playableDecks.map((deck) => (
        <Card
          key={deck.id}
          onPress={() => openPlay(gameModeToParam({ kind: 'deck', deckId: deck.id }))}
        >
          <Text variant="heading">
            {deck.emoji} {deck.name}
          </Text>
          <Text variant="caption" muted>
            {deck.questionCount} questions · deck complet
          </Text>
        </Card>
      ))}

      <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
        <Button
          label="📚 Explorer les decks"
          variant="secondary"
          onPress={() => router.push('/decks')}
        />
        <Button label="⚙️ Réglages" variant="ghost" onPress={() => router.push('/settings')} />
      </View>

      <Text variant="caption" color={colors.textMuted} style={{ textAlign: 'center' }}>
        {CATALOG.decks.filter((d) => d.tier === 'free').length} decks gratuits ·{' '}
        {CATALOG.questions.length} questions embarquées
      </Text>
    </Screen>
  );
}
