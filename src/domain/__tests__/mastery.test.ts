import { CONFIG } from '@/data/config';
import {
  applyOutcome,
  isMastered,
  scoreForAnswer,
  setMastery,
  shuffleQuestions,
  summarizeSession,
} from '../mastery';
import type { Question } from '../types';

const NOW = () => '2026-09-03T00:00:00.000Z';

describe('applyOutcome', () => {
  it('increments streak on correct answers and marks mastery at the threshold', () => {
    let p = applyOutcome(undefined, { questionId: 'q1', correct: true, difficulty: 2 }, NOW);
    for (let i = 1; i < CONFIG.MASTERY_STREAK; i++) {
      p = applyOutcome(p, { questionId: 'q1', correct: true, difficulty: 2 }, NOW);
    }
    expect(p.streak).toBe(CONFIG.MASTERY_STREAK);
    expect(p.masteredAt).toBe(NOW());
    expect(p.seen).toBe(CONFIG.MASTERY_STREAK);
  });

  it('resets streak on a wrong answer but keeps mastery flag', () => {
    let p = applyOutcome(undefined, { questionId: 'q1', correct: true, difficulty: 1 }, NOW);
    p = applyOutcome(p, { questionId: 'q1', correct: true, difficulty: 1 }, NOW);
    p = applyOutcome(p, { questionId: 'q1', correct: true, difficulty: 1 }, NOW);
    p = applyOutcome(p, { questionId: 'q1', correct: false, difficulty: 1 }, NOW);
    expect(p.streak).toBe(0);
    expect(p.masteredAt).toBe(NOW());
  });
});

describe('setMastery', () => {
  it('marks an unseen question as mastered and lifts the streak to the threshold', () => {
    const p = setMastery(undefined, 'q1', true, NOW);
    expect(isMastered(p)).toBe(true);
    expect(p.masteredAt).toBe(NOW());
    expect(p.streak).toBe(CONFIG.MASTERY_STREAK);
    expect(p.seen).toBe(0);
  });

  it('unmarks a mastered question, resets the streak, keeps history', () => {
    const mastered = { questionId: 'q1', seen: 8, correct: 6, streak: 4, masteredAt: NOW() };
    const p = setMastery(mastered, 'q1', false);
    expect(isMastered(p)).toBe(false);
    expect(p.masteredAt).toBeUndefined();
    expect(p.streak).toBe(0);
    expect(p.seen).toBe(8);
    expect(p.correct).toBe(6);
  });

  it('does not move masteredAt when already mastered', () => {
    const first = setMastery(undefined, 'q1', true, () => '2026-01-01T00:00:00.000Z');
    const again = setMastery(first, 'q1', true, () => '2026-09-03T00:00:00.000Z');
    expect(again.masteredAt).toBe('2026-01-01T00:00:00.000Z');
  });
});

describe('scoreForAnswer', () => {
  it('is zero for a wrong answer', () => {
    expect(scoreForAnswer({ questionId: 'q', correct: false, difficulty: 5 }, 3)).toBe(0);
  });

  it('adds difficulty and streak bonuses', () => {
    const expected =
      CONFIG.SCORE_BASE + CONFIG.SCORE_DIFFICULTY_BONUS * 2 + CONFIG.SCORE_STREAK_BONUS * 2;
    expect(scoreForAnswer({ questionId: 'q', correct: true, difficulty: 3 }, 2)).toBe(expected);
  });
});

describe('summarizeSession', () => {
  it('counts newly mastered questions once', () => {
    const outcomes = Array.from({ length: CONFIG.MASTERY_STREAK }, () => ({
      questionId: 'q1',
      correct: true,
      difficulty: 1,
    }));
    const { summary } = summarizeSession(outcomes, {}, NOW);
    expect(summary.correct).toBe(CONFIG.MASTERY_STREAK);
    expect(summary.newlyMastered).toEqual(['q1']);
  });
});

describe('shuffleQuestions', () => {
  const pool: Question[] = Array.from({ length: 20 }, (_, i) => ({
    id: `q${i}`,
    deckId: 'd',
    categoryId: 'c',
    difficulty: 2,
    type: 'single',
    prompt: `q${i}`,
    answers: [{ id: 'a', text: 'a', correct: true }],
  }));

  it('keeps every question exactly once — no truncation', () => {
    const shuffled = shuffleQuestions(pool, () => 0.5);
    expect(shuffled).toHaveLength(pool.length);
    expect(new Set(shuffled.map((q) => q.id))).toEqual(new Set(pool.map((q) => q.id)));
  });

  it('does not mutate the input pool', () => {
    const copy = [...pool];
    shuffleQuestions(pool, Math.random);
    expect(pool).toEqual(copy);
  });

  function seededRng(seq: number[]) {
    let i = 0;
    return () => seq[i++ % seq.length];
  }

  it('is deterministic for a fixed rng', () => {
    const seq = [0.1, 0.9, 0.3, 0.7, 0.5, 0.2, 0.8];
    const a = shuffleQuestions(pool, seededRng(seq));
    const b = shuffleQuestions(pool, seededRng(seq));
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });

  it('actually reorders a large pool (not a no-op)', () => {
    const shuffled = shuffleQuestions(pool, seededRng([0.9, 0.1, 0.8, 0.2, 0.7, 0.3]));
    expect(shuffled.map((q) => q.id)).not.toEqual(pool.map((q) => q.id));
  });
});
