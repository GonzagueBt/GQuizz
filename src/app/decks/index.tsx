import { View } from 'react-native';
import { router, Stack } from 'expo-router';

import { DeckCard } from '@/components/DeckCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { CATALOG } from '@/data/catalog';
import { isDeckAccessible } from '@/domain/ownership';
import { useOwnershipStore } from '@/store/ownershipStore';

export default function DecksScreen() {
  const ownedDeckIds = useOwnershipStore((s) => s.ownedDeckIds);
  const owns = (deckId: string) => {
    const deck = CATALOG.decks.find((d) => d.id === deckId);
    return deck ? isDeckAccessible(deck, ownedDeckIds) : false;
  };

  const mine = CATALOG.decks.filter((d) => owns(d.id));
  const toDiscover = CATALOG.decks.filter((d) => !owns(d.id));

  return (
    <Screen scroll>
      <Stack.Screen options={{ headerShown: true, title: '📚 Decks' }} />

      <Text variant="label" muted>
        MES DECKS
      </Text>
      <View style={{ gap: 12 }}>
        {mine.map((deck) => (
          <DeckCard
            key={deck.id}
            deck={deck}
            owned
            onPress={() => router.push({ pathname: '/decks/[id]', params: { id: deck.id } })}
          />
        ))}
      </View>

      {toDiscover.length > 0 && (
        <>
          <Text variant="label" muted style={{ marginTop: 12 }}>
            À DÉCOUVRIR
          </Text>
          <View style={{ gap: 12 }}>
            {toDiscover.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                owned={false}
                onPress={() => router.push({ pathname: '/decks/[id]', params: { id: deck.id } })}
              />
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
