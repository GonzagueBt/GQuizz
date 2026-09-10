import { useEffect, type ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  children: ReactNode;
  /** Position dans une liste — décale l'entrée pour un effet en cascade. */
  index?: number;
  style?: ViewStyle;
}

const STEP_MS = 55;
const DURATION_MS = 320;

/** Fait apparaître son contenu en fondu + léger glissement vertical au montage. */
export function Reveal({ children, index = 0, style }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      index * STEP_MS,
      withTiming(1, { duration: DURATION_MS, easing: Easing.out(Easing.cubic) }),
    );
    // Anime uniquement au montage : un `index` qui change ensuite ne doit pas rejouer l'entrée.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 12 }],
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
