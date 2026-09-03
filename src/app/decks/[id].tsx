import { useState } from 'react';
import { Alert, View } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { CATALOG, getDeck, questionsById } from '@/data/catalog';
import { CategoryTree } from '@/domain/categoryTree';
import { isDeckAccessible } from '@/domain/ownership';
import { useTheme } from '@/hooks/useTheme';
import { useOwnershipStore } from '@/store/ownershipStore';

const DIFFICULTY_LABEL = ['', 'Facile', 'Facile', 'Moyen', 'Difficile', 'Expert'];

export default function DeckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const deck = getDeck(id);
  const ownedDeckIds = useOwnershipStore((s) => s.ownedDeckIds);
  const purchase = useOwnershipStore((s) => s.purchase);
  const restore = useOwnershipStore((s) => s.restore);
  const { colors, spacing } = useTheme();
  const [busy, setBusy] = useState(false);

  if (!deck) {
    return (
      <Screen>
        <Text>Deck introuvable.</Text>
      </Screen>
    );
  }

  const owned = isDeckAccessible(deck, ownedDeckIds);
  const tree = new CategoryTree(CATALOG.categories);
  const categoryPath = tree
    .path(deck.subcategoryId ?? deck.categoryId)
    .map((c) => c.name)
    .join(' › ');
  const preview = questionsById(deck.previewQuestionIds ?? []);

  const onBuy = async () => {
    setBusy(true);
    const result = await purchase(deck);
    setBusy(false);
    if (result.ok) {
      Alert.alert('✓ Deck débloqué', `« ${deck.name} » est maintenant disponible.`);
    } else if (result.reason !== 'cancelled') {
      Alert.alert('Achat impossible', 'Réessaie plus tard.');
    }
  };

  const onRestore = async () => {
    setBusy(true);
    await restore();
    setBusy(false);
  };

  return (
    <Screen scroll>
      <Stack.Screen options={{ headerShown: true, title: deck.name }} />

      <View style={{ alignItems: 'center', gap: spacing.sm }}>
        <Text style={{ fontSize: 56 }}>{deck.emoji}</Text>
        <Text variant="title" style={{ textAlign: 'center' }}>
          {deck.name}
        </Text>
        <Text muted style={{ textAlign: 'center' }}>
          {deck.description}
        </Text>
      </View>

      <Card>
        <Row label="Catégorie" value={categoryPath} />
        <Row label="Questions" value={`${deck.questionCount}`} />
        <Row label="Difficulté moyenne" value={DIFFICULTY_LABEL[deck.averageDifficulty]} />
        <Row
          label="Statut"
          value={owned ? (deck.tier === 'free' ? 'Gratuit' : 'Possédé') : (deck.priceHint ?? 'Premium')}
        />
      </Card>

      {preview.length > 0 && (
        <View style={{ gap: spacing.sm }}>
          <Text variant="label" muted>
            APERÇU
          </Text>
          {preview.map((q) => (
            <Card key={q.id}>
              <Text variant="label">{q.prompt}</Text>
              <Text variant="caption" muted>
                {q.answers.length} réponses possibles
              </Text>
            </Card>
          ))}
        </View>
      )}

      {owned ? (
        <Button
          label="JOUER"
          onPress={() =>
            router.replace({ pathname: '/play/[mode]', params: { mode: `deck:${deck.id}` } })
          }
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          <Text variant="heading" style={{ textAlign: 'center' }} color={colors.accent}>
            {deck.priceHint ?? 'Premium'}
          </Text>
          <Button
            label="ACHETER"
            loading={busy}
            onPress={onBuy}
          />
          <Button label="Restaurer mes achats" variant="ghost" onPress={onRestore} />
        </View>
      )}
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Text variant="caption" muted>
        {label}
      </Text>
      <Text variant="caption" style={{ flexShrink: 1, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}
