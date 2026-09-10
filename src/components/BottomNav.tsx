import { useEffect, useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import { router, usePathname, type Href } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface Tab {
  href: Href;
  emoji: string;
  label: string;
}

const TABS: Tab[] = [
  { href: '/', emoji: '🏠', label: 'Jouer' },
  { href: '/decks', emoji: '📚', label: 'Decks' },
  { href: '/stats', emoji: '📊', label: 'Progrès' },
  { href: '/settings', emoji: '⚙️', label: 'Réglages' },
];

/** Barre de navigation persistante des 4 écrans principaux, avec indicateur animé. */
export function BottomNav() {
  const pathname = usePathname();
  const { colors, radius, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const indicator = useSharedValue(0);

  const activeIndex = Math.max(
    0,
    TABS.findIndex((t) => t.href === pathname),
  );

  useEffect(() => {
    if (width > 0) {
      indicator.value = withSpring(activeIndex * (width / TABS.length), {
        damping: 18,
        stiffness: 180,
      });
    }
  }, [activeIndex, width, indicator]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicator.value }],
    width: width / TABS.length,
  }));

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      style={{
        flexDirection: 'row',
        borderTopWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingBottom: insets.bottom || spacing.sm,
        paddingTop: spacing.sm,
      }}
    >
      {width > 0 && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: spacing.xs,
              left: 0,
              height: 46,
              borderRadius: radius.lg,
              backgroundColor: colors.surfaceAlt,
            },
            indicatorStyle,
          ]}
        />
      )}
      {TABS.map((tab, i) => (
        <TabButton key={tab.label} tab={tab} active={i === activeIndex} />
      ))}
    </View>
  );
}

function TabButton({ tab, active }: { tab: Tab; active: boolean }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <Pressable
        accessibilityRole="tab"
        accessibilityLabel={tab.label}
        accessibilityState={{ selected: active }}
        onPressIn={() => {
          scale.value = withTiming(0.9, { duration: 90 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 150 });
        }}
        onPress={() => {
          if (!active) router.replace(tab.href);
        }}
        style={{ alignItems: 'center', gap: 2, paddingVertical: 4 }}
      >
        <Text style={{ fontSize: 20, lineHeight: 24 }}>{tab.emoji}</Text>
        <Text
          variant="caption"
          color={active ? colors.primary : colors.textMuted}
          style={{ fontSize: 11 }}
        >
          {tab.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
