import type { ReactNode } from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';

interface Props {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, onPress, style }: Props) {
  const { colors, radius, spacing } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  };

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          onPressIn={() => {
            scale.value = withTiming(0.98, { duration: 90 });
          }}
          onPressOut={() => {
            scale.value = withTiming(1, { duration: 150 });
          }}
          style={({ pressed }) => [base, style, pressed && { opacity: 0.92 }]}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }
  return <View style={[base, style]}>{children}</View>;
}
