import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Props {
  emoji: string;
  /** Libellé accessibilité (non affiché). */
  label: string;
  onPress: () => void;
}

/** Bouton carré 44×44 avec un émoji — pour les actions secondaires en en-tête. */
export function IconButton({ emoji, label, onPress }: Props) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text style={{ fontSize: 20, lineHeight: 24 }}>{emoji}</Text>
    </Pressable>
  );
}
