import { View } from 'react-native';
import { router } from 'expo-router';

import { BottomNav } from '@/components/BottomNav';
import { DeckCard } from '@/components/DeckCard';
import { Reveal } from '@/components/Reveal';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { CATALOG } from '@/data/catalog';
import { isDeckAccessible } from '@/domain/ownership';
import { useTheme } from '@/hooks/useTheme';
import { useOwnershipStore } from '@/store/ownershipStore';

export default function DecksScreen() {
  const ownedDeckIds = useOwnershipStore((s) => s.ownedDeckIds);
  const { colors, spacing } = useTheme();
  const owns = (deckId: string) => {
    const deck = CATALOG.decks.find((d) => d.id === deckId);
    return deck ? isDeckAccessible(deck, ownedDeckIds) : false;
  };

  const mine = CATALOG.decks.filter((d) => owns(d.id));
  const toDiscover = CATALOG.decks.filter((d) => !owns(d.id));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen scroll edges={['top']}>
        <Reveal>
          <Text variant="title">📚 Decks</Text>
          <Text muted>Tous les thèmes disponibles, un jeu complet à la fois.</Text>
        </Reveal>

        <Text variant="label" muted style={{ marginTop: spacing.sm }}>
          MES DECKS
        </Text>
        <View style={{ gap: 12 }}>
          {mine.map((deck, i) => (
            <Reveal key={deck.id} index={i + 1}>
              <DeckCard
                deck={deck}
                owned
                onPress={() => router.push({ pathname: '/decks/[id]', params: { id: deck.id } })}
              />
            </Reveal>
          ))}
        </View>

        {toDiscover.length > 0 && (
          <>
            <Text variant="label" muted style={{ marginTop: 12 }}>
              À DÉCOUVRIR
            </Text>
            <View style={{ gap: 12 }}>
              {toDiscover.map((deck, i) => (
                <Reveal key={deck.id} index={mine.length + i + 1}>
                  <DeckCard
                    deck={deck}
                    owned={false}
                    onPress={() => router.push({ pathname: '/decks/[id]', params: { id: deck.id } })}
                  />
                </Reveal>
              ))}
            </View>
          </>
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}
