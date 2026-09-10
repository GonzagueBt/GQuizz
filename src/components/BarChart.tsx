import { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

export interface BarChartDatum {
  label: string;
  value: number;
}

interface Props {
  data: BarChartDatum[];
  height?: number;
  color?: string;
}

/** Diagramme en barres minimal (pas de dépendance SVG), animé à l'apparition. */
export function BarChart({ data, height = 110, color }: Props) {
  const { colors, radius, spacing } = useTheme();
  const barColor = color ?? colors.primary;
  const max = useMemo(() => Math.max(1, ...data.map((d) => d.value)), [data]);

  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height, gap: spacing.sm }}>
        {data.map((d, i) => (
          <Bar
            key={i}
            value={d.value}
            max={max}
            height={height}
            color={barColor}
            radius={radius.sm}
            index={i}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="caption" muted numberOfLines={1} style={{ fontSize: 10 }}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Bar({
  value,
  max,
  height,
  color,
  radius,
  index,
}: {
  value: number;
  max: number;
  height: number;
  color: string;
  radius: number;
  index: number;
}) {
  const progress = useSharedValue(0);
  const targetRatio = value > 0 ? Math.max(value / max, 0.04) : 0;

  useEffect(() => {
    progress.value = withDelay(
      index * 45,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    height: Math.max(3, targetRatio * height * progress.value),
  }));

  return (
    <View style={{ flex: 1, height, justifyContent: 'flex-end' }}>
      <Animated.View style={[{ borderRadius: radius, backgroundColor: color }, animatedStyle]} />
    </View>
  );
}
