import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import type { Deck } from '@/domain/types';
import { Card } from './Card';
import { Text } from './Text';

interface Props {
  deck: Deck;
  owned: boolean;
  onPress: () => void;
}

const DIFFICULTY_LABEL = ['', 'Facile', 'Facile', 'Moyen', 'Difficile', 'Expert'];

export function DeckCard({ deck, owned, onPress }: Props) {
  const { colors, spacing } = useTheme();

  const status = owned
    ? deck.tier === 'free'
      ? 'Gratuit'
      : '✓ Possédé'
    : (deck.priceHint ?? 'Premium');

  return (
    <Card onPress={onPress}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <Text style={{ fontSize: 32 }}>{deck.emoji}</Text>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="heading">{deck.name}</Text>
          <Text variant="caption" muted>
            {deck.questionCount} questions · {DIFFICULTY_LABEL[deck.averageDifficulty]}
          </Text>
        </View>
        <Text
          variant="label"
          color={owned ? colors.success : colors.accent}
        >
          {status}
        </Text>
      </View>
      <Text variant="caption" muted numberOfLines={2}>
        {deck.description}
      </Text>
      {deck.tags?.includes('nouveau') && (
        <Text variant="caption" color={colors.primary}>
          ● Nouveau
        </Text>
      )}
    </Card>
  );
}
