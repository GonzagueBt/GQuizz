import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

type Status = 'idle' | 'correct' | 'wrong' | 'missed';

interface Props {
  label: string;
  status: Status;
  disabled?: boolean;
  onPress: () => void;
}

export function AnswerButton({ label, status, disabled, onPress }: Props) {
  const { colors, radius, spacing } = useTheme();

  const bg =
    status === 'correct'
      ? colors.success
      : status === 'wrong'
        ? colors.danger
        : status === 'missed'
          ? colors.surfaceAlt
          : colors.surface;
  const fg = status === 'correct' || status === 'wrong' ? colors.primaryText : colors.text;
  const borderColor = status === 'missed' ? colors.success : colors.border;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderRadius: radius.md,
          padding: spacing.lg,
          opacity: pressed && !disabled ? 0.9 : 1,
        },
      ]}
    >
      <Text color={fg}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderWidth: 1.5, minHeight: 52, justifyContent: 'center' },
});
