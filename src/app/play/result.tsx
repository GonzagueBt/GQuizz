import { useEffect } from 'react';
import { View } from 'react-native';
import { Redirect, router } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Reveal } from '@/components/Reveal';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { useSessionStore } from '@/store/sessionStore';

export default function ResultScreen() {
  const summary = useSessionStore((s) => s.lastSummary);
  const label = useSessionStore((s) => s.lastModeLabel);
  const modeParam = useSessionStore((s) => s.lastModeParam);
  const livesLeft = useSessionStore((s) => s.lastLivesLeft);
  const { colors } = useTheme();
  const bounce = useSharedValue(0.4);

  useEffect(() => {
    bounce.value = withSequence(
      withSpring(1.15, { damping: 6, stiffness: 140 }),
      withSpring(1, { damping: 8, stiffness: 160 }),
    );
    // Joue une seule fois au montage.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bounceStyle = useAnimatedStyle(() => ({ transform: [{ scale: bounce.value }] }));

  if (!summary) return <Redirect href="/" />;

  const ratio = summary.total ? Math.round((summary.correct / summary.total) * 100) : 0;
  const cleared = livesLeft > 0;

  return (
    <Screen scroll contentStyle={{ justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', gap: 6 }}>
        <Text variant="caption" muted>
          {label}
        </Text>
        <Animated.View style={bounceStyle}>
          <Text variant="heading" color={cleared ? colors.success : colors.danger}>
            {cleared ? '🎉 Deck terminé !' : '💔 Plus de vies'}
          </Text>
        </Animated.View>
        <Text variant="title">{ratio}%</Text>
        <Text muted>
          {summary.correct} / {summary.total} bonnes réponses
        </Text>
      </View>

      <Reveal index={1}>
        <Card style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}>
            <Text variant="heading" color={colors.accent}>
              +{summary.score}
            </Text>
            <Text variant="caption" muted>
              points
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text variant="heading" color={colors.success}>
              {summary.newlyMastered.length}
            </Text>
            <Text variant="caption" muted>
              nouvelles maîtrisées
            </Text>
          </View>
        </Card>
      </Reveal>

      <Reveal index={2}>
        <View style={{ gap: 10 }}>
          <Button
            label="Rejouer"
            onPress={() =>
              router.replace({ pathname: '/play/[mode]', params: { mode: modeParam || 'global' } })
            }
          />
          <Button label="Voir ma progression" variant="secondary" onPress={() => router.replace('/stats')} />
          <Button label="Retour à l'accueil" variant="ghost" onPress={() => router.replace('/')} />
        </View>
      </Reveal>
    </Screen>
  );
}
