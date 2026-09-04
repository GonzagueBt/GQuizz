import { useEffect, useRef, useState } from 'react';
import { BackHandler, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { AnswerButton } from '@/components/AnswerButton';
import { Button } from '@/components/Button';
import { useConfirm } from '@/components/ConfirmProvider';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { CATALOG, getDeck } from '@/data/catalog';
import { CONFIG } from '@/data/config';
import { parseGameMode } from '@/domain/gameMode';
import type { AnswerOutcome } from '@/domain/mastery';
import { shuffleQuestions } from '@/domain/mastery';
import { buildQuestionPool, PoolError } from '@/domain/questionPool';
import type { GameMode, Question } from '@/domain/types';
import { useTheme } from '@/hooks/useTheme';
import { feedback } from '@/lib/haptics';
import { useAppStore } from '@/store/appStore';
import { useOwnershipStore } from '@/store/ownershipStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useProgressStore } from '@/store/progressStore';
import { useSessionStore } from '@/store/sessionStore';

function modeLabel(mode: GameMode): string {
  if (mode.kind === 'deck') return getDeck(mode.deckId)?.name ?? 'Deck';
  if (mode.kind === 'global') return '🌎 Global personnalisé';
  return mode.kind;
}

interface InitState {
  questions: Question[];
  error: string | null;
}

function initSession(mode: GameMode): InitState {
  const prefs = usePreferencesStore.getState().prefs;
  const isDeckOwned = useOwnershipStore.getState().isDeckOwned;
  const progress = useProgressStore.getState().progress;
  try {
    const pool = buildQuestionPool({
      mode,
      questions: CATALOG.questions,
      categories: CATALOG.categories,
      prefs,
      isDeckOwned,
      isMastered: (id) => !!progress[id]?.masteredAt,
    });
    // Une partie enchaîne TOUT le pool, mélangé — pas de format court. Elle
    // s'arrête d'elle-même quand les vies sont épuisées (voir CONFIG.STARTING_LIVES).
    return { questions: shuffleQuestions(pool), error: null };
  } catch (e) {
    return { questions: [], error: e instanceof PoolError ? e.message : String(e) };
  }
}

export default function PlayScreen() {
  const { mode: modeParam } = useLocalSearchParams<{ mode: string }>();
  const [mode] = useState<GameMode>(() => parseGameMode(modeParam));
  const [session] = useState<InitState>(() => initSession(mode));
  const autoAdvance = useAppStore((s) => s.autoAdvanceOnCorrect);
  const setMastered = useProgressStore((s) => s.setMastered);
  const confirm = useConfirm();
  const { colors } = useTheme();

  const [index, setIndex] = useState(0);
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [lives, setLives] = useState<number>(CONFIG.STARTING_LIVES);
  // Réponses accumulées : ref (et non state) pour rester à jour dans le
  // setTimeout du passage automatique.
  const outcomes = useRef<AnswerOutcome[]>([]);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaving = useRef(false);

  const hasError = session.error !== null;

  const clearAdvanceTimer = () => {
    if (advanceTimer.current) {
      clearTimeout(advanceTimer.current);
      advanceTimer.current = null;
    }
  };

  const confirmQuit = async () => {
    const ok = await confirm({
      title: 'Quitter la partie ?',
      message: 'La progression de cette partie sera perdue.',
      confirmLabel: 'Quitter',
      cancelLabel: 'Continuer à jouer',
      destructive: true,
    });
    if (!ok) return;
    leaving.current = true;
    clearAdvanceTimer();
    router.replace('/');
  };

  // Bouton retour matériel Android : demande confirmation au lieu de quitter.
  useEffect(() => {
    if (hasError) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (leaving.current) return false;
      void confirmQuit();
      return true;
    });
    return () => sub.remove();
    // confirmQuit ne dépend d'aucune valeur changeante.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasError]);

  useEffect(() => clearAdvanceTimer, []);

  if (session.error) {
    return (
      <Screen contentStyle={{ justifyContent: 'center' }}>
        <Text variant="heading">Impossible de lancer la partie</Text>
        <Text muted>{session.error}</Text>
        <Button label="Retour" onPress={() => router.back()} />
      </Screen>
    );
  }

  const question = session.questions[index];
  const total = session.questions.length;
  const revealed = chosenId !== null;
  const isLast = index >= total - 1;
  const outOfLives = lives <= 0;
  const isFinalScreen = isLast || outOfLives;
  const chosenCorrect = revealed && !!question.answers.find((a) => a.id === chosenId)?.correct;
  const autoAdvancing = chosenCorrect && autoAdvance && !isFinalScreen;

  const goNext = () => {
    clearAdvanceTimer();
    if (!isFinalScreen) {
      setIndex((i) => i + 1);
      setChosenId(null);
      return;
    }
    leaving.current = true;
    const summary = useProgressStore.getState().applySession(outcomes.current);
    useSessionStore.getState().setResult(summary, modeLabel(mode), modeParam, lives);
    router.replace('/play/result');
  };

  const answer = (answerId: string) => {
    if (revealed) return;
    const correct = question.answers.find((a) => a.id === answerId)?.correct ?? false;
    setChosenId(answerId);
    feedback(correct);
    outcomes.current.push({ questionId: question.id, correct, difficulty: question.difficulty });
    if (!correct) {
      setLives((l) => Math.max(0, l - 1));
    } else if (autoAdvance && !isLast) {
      advanceTimer.current = setTimeout(goNext, CONFIG.AUTO_ADVANCE_DELAY_MS);
    }
  };

  const markMastered = async () => {
    if (revealed) return;
    const ok = await confirm({
      title: 'Enregistrer comme maîtrisée ?',
      message:
        "Cette question ne te sera plus posée tant qu'elle est maîtrisée. Elle pourra encore " +
        'apparaître en mode Global personnalisé, pour le score.',
      confirmLabel: 'Maîtrisée',
      cancelLabel: 'Annuler',
    });
    if (!ok) return;
    setMastered(question.id, true);
    goNext();
  };

  const hearts = Array.from({ length: CONFIG.STARTING_LIVES }, (_, i) =>
    i < lives ? '❤️' : '🤍',
  ).join('');

  return (
    <Screen scroll>
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => void confirmQuit()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Quitter la partie"
          >
            <Text style={{ fontSize: 20, lineHeight: 22 }} color={colors.textMuted}>
              ✕
            </Text>
          </Pressable>
          <Text variant="caption" muted style={{ flex: 1 }} numberOfLines={1}>
            {modeLabel(mode)}
          </Text>
          <Text accessibilityLabel={`${lives} vie${lives > 1 ? 's' : ''} restante${lives > 1 ? 's' : ''}`}>
            {hearts}
          </Text>
        </View>
        <ProgressBar value={total ? index / total : 0} />
        <Text variant="caption" muted style={{ textAlign: 'right' }}>
          {index + 1} / {total}
        </Text>
      </View>

      <Text variant="heading">{question.prompt}</Text>

      <View style={{ gap: 10 }}>
        {question.answers.map((a) => {
          const status = !revealed
            ? 'idle'
            : a.correct
              ? 'correct'
              : a.id === chosenId
                ? 'wrong'
                : 'idle';
          return (
            <AnswerButton
              key={a.id}
              label={a.text}
              status={status}
              disabled={revealed}
              onPress={() => answer(a.id)}
            />
          );
        })}
      </View>

      {!revealed && (
        <Pressable
          onPress={() => void markMastered()}
          accessibilityRole="button"
          style={{ alignSelf: 'center', paddingVertical: 6 }}
        >
          <Text variant="caption" color={colors.textMuted}>
            ★ Je maîtrise déjà cette question
          </Text>
        </Pressable>
      )}

      {revealed && !autoAdvancing && (
        <View style={{ gap: 12 }}>
          {outOfLives && (
            <Text variant="label" color={colors.danger}>
              💔 Plus de vies !
            </Text>
          )}
          {question.explanation ? <Text muted>{question.explanation}</Text> : null}
          <Button label={isFinalScreen ? 'Voir les résultats' : 'Suivant'} onPress={goNext} />
        </View>
      )}

      {autoAdvancing && (
        <Text variant="label" color={colors.success}>
          Bonne réponse ✓
        </Text>
      )}
    </Screen>
  );
}
