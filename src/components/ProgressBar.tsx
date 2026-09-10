import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';

export function ProgressBar({ value }: { value: number }) {
  const { colors, radius } = useTheme();
  const pct = Math.max(0, Math.min(1, value));
  const progress = useSharedValue(pct);

  useEffect(() => {
    progress.value = withTiming(pct, { duration: 320 });
  }, [pct, progress]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View
      style={{
        height: 8,
        borderRadius: radius.pill,
        backgroundColor: colors.surfaceAlt,
        overflow: 'hidden',
      }}
    >
      <Animated.View
        style={[
          { height: '100%', borderRadius: radius.pill, backgroundColor: colors.primary },
          animatedStyle,
        ]}
      />
    </View>
  );
}
