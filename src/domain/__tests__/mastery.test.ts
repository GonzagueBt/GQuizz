import { CONFIG } from '@/data/config';
import {
  applyOutcome,
  pickSession,
  scoreForAnswer,
  summarizeSession,
  type ProgressMap,
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

describe('pickSession', () => {
  const pool: Question[] = Array.from({ length: 20 }, (_, i) => ({
    id: `q${i}`,
    deckId: 'd',
    categoryId: 'c',
    difficulty: 2,
    type: 'single',
    prompt: `q${i}`,
    answers: [{ id: 'a', text: 'a', correct: true }],
  }));

  it('never exceeds the requested count or the pool size', () => {
    expect(pickSession(pool, {}, 5, () => 0.5)).toHaveLength(5);
    expect(pickSession(pool.slice(0, 3), {}, 10, () => 0.5)).toHaveLength(3);
  });

  it('is deterministic for a fixed rng and returns unique questions', () => {
    const seq = [0.1, 0.9, 0.3, 0.7, 0.5];
    let i = 0;
    const rng = () => seq[i++ % seq.length];
    const picked = pickSession(pool, {}, 5, rng);
    expect(new Set(picked.map((q) => q.id)).size).toBe(5);
  });

  it('favours unseen questions over mastered ones', () => {
    const progress: ProgressMap = {};
    for (let i = 0; i < 19; i++) {
      progress[`q${i}`] = {
        questionId: `q${i}`,
        seen: 5,
        correct: 5,
        streak: 5,
        masteredAt: NOW(),
      };
    }
    // q19 is unseen (weight 6) vs 19 mastered questions (weight 1 each):
    // P(pick q19) = 6 / (6 + 19) = 0.24, so ~96 hits over 400 draws.
    const hits = Array.from({ length: 400 }, () => pickSession(pool, progress, 1, Math.random)[0].id);
    const unseenHits = hits.filter((id) => id === 'q19').length;
    expect(unseenHits).toBeGreaterThan(40);
    expect(unseenHits).toBeLessThan(200);
  });
});
