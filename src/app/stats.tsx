import { View } from 'react-native';

import { BarChart } from '@/components/BarChart';
import { BottomNav } from '@/components/BottomNav';
import { Card } from '@/components/Card';
import { Reveal } from '@/components/Reveal';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { cumulativeMastered, overallAccuracy, type SessionRecord } from '@/domain/stats';
import { useTheme } from '@/hooks/useTheme';
import { useProgressStore } from '@/store/progressStore';

const CHART_SESSIONS = 10;

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StatsScreen() {
  const totalScore = useProgressStore((s) => s.totalScore);
  const gamesPlayed = useProgressStore((s) => s.gamesPlayed);
  const masteredCount = useProgressStore((s) => s.masteredCount());
  const history = useProgressStore((s) => s.history);
  const { colors, spacing } = useTheme();

  const recentHistory = history.slice(-CHART_SESSIONS);
  const accuracy = overallAccuracy(history);
  const masteryTrend = cumulativeMastered(history).slice(-CHART_SESSIONS);
  const recentFirst = [...history].reverse().slice(0, 15);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Screen scroll edges={['top']}>
        <Reveal>
          <Text variant="title">📊 Progression</Text>
          <Text muted>Ton parcours, partie après partie.</Text>
        </Reveal>

        <Reveal index={1}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <StatCard label="Score total" value={`${totalScore}`} color={colors.accent} />
            <StatCard label="Parties jouées" value={`${gamesPlayed}`} />
          </View>
        </Reveal>
        <Reveal index={2}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <StatCard label="Précision" value={`${accuracy}%`} color={colors.primary} />
            <StatCard label="Maîtrisées" value={`${masteredCount}`} color={colors.success} />
          </View>
        </Reveal>

        {history.length === 0 ? (
          <Reveal index={3}>
            <Card>
              <Text muted>
                Joue une première partie pour voir ta progression apparaître ici : score par
                partie, précision, et croissance des questions maîtrisées.
              </Text>
            </Card>
          </Reveal>
        ) : (
          <>
            <Reveal index={3}>
              <Card style={{ gap: spacing.md }}>
                <Text variant="label" muted>
                  SCORE PAR PARTIE
                </Text>
                <BarChart
                  data={recentHistory.map((r) => ({ label: shortDate(r.date), value: r.score }))}
                />
              </Card>
            </Reveal>

            <Reveal index={4}>
              <Card style={{ gap: spacing.md }}>
                <Text variant="label" muted>
                  MAÎTRISE CUMULÉE
                </Text>
                <BarChart
                  color={colors.success}
                  data={recentHistory.map((r, i) => ({
                    label: shortDate(r.date),
                    value: masteryTrend[i] ?? 0,
                  }))}
                />
              </Card>
            </Reveal>

            <Text variant="label" muted style={{ marginTop: spacing.sm }}>
              DERNIÈRES PARTIES
            </Text>
            <View style={{ gap: spacing.sm }}>
              {recentFirst.map((record, i) => (
                <Reveal key={record.id} index={i + 5}>
                  <SessionRow record={record} />
                </Reveal>
              ))}
            </View>
          </>
        )}
      </Screen>
      <BottomNav />
    </View>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center' }}>
      <Text variant="heading" color={color}>
        {value}
      </Text>
      <Text variant="caption" muted style={{ textAlign: 'center' }}>
        {label}
      </Text>
    </Card>
  );
}

function SessionRow({ record }: { record: SessionRecord }) {
  const { colors, spacing } = useTheme();
  const pct = record.total ? Math.round((record.correct / record.total) * 100) : 0;
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" numberOfLines={1}>
            {record.modeLabel}
          </Text>
          <Text variant="caption" muted>
            {fullDate(record.date)} · {record.correct}/{record.total} bonnes réponses
            {record.mastered > 0 ? ` · +${record.mastered} maîtrisée${record.mastered > 1 ? 's' : ''}` : ''}
          </Text>
        </View>
        <Text variant="heading" color={colors.accent}>
          +{record.score}
        </Text>
        <Text variant="caption" muted>
          {pct}%
        </Text>
      </View>
    </Card>
  );
}
