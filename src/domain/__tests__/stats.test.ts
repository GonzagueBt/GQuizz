import { appendHistory, buildSessionRecord, cumulativeMastered, overallAccuracy } from '../stats';
import type { SessionSummary } from '../mastery';

const NOW = () => '2026-09-10T00:00:00.000Z';

const summary = (over: Partial<SessionSummary> = {}): SessionSummary => ({
  total: 10,
  correct: 7,
  score: 700,
  newlyMastered: ['q1', 'q2'],
  ...over,
});

describe('buildSessionRecord', () => {
  it('captures the summary with a date and the provided id', () => {
    const record = buildSessionRecord(summary(), '🌎 Global personnalisé', 'abc', NOW);
    expect(record).toEqual({
      id: 'abc',
      date: NOW(),
      modeLabel: '🌎 Global personnalisé',
      total: 10,
      correct: 7,
      score: 700,
      mastered: 2,
    });
  });
});

describe('appendHistory', () => {
  const record = (id: string) => buildSessionRecord(summary(), 'deck', id, NOW);

  it('appends to the end of the history', () => {
    const history = appendHistory([record('a')], record('b'));
    expect(history.map((r) => r.id)).toEqual(['a', 'b']);
  });

  it('trims the oldest entries beyond the max size', () => {
    const history = [record('a'), record('b'), record('c')];
    const next = appendHistory(history, record('d'), 3);
    expect(next.map((r) => r.id)).toEqual(['b', 'c', 'd']);
  });

  it('does not mutate the input array', () => {
    const history = [record('a')];
    const copy = [...history];
    appendHistory(history, record('b'));
    expect(history).toEqual(copy);
  });
});

describe('overallAccuracy', () => {
  it('is 0 with no history', () => {
    expect(overallAccuracy([])).toBe(0);
  });

  it('averages correct/total across every session', () => {
    const history = [
      buildSessionRecord(summary({ total: 10, correct: 5 }), 'a', '1', NOW),
      buildSessionRecord(summary({ total: 10, correct: 10 }), 'b', '2', NOW),
    ];
    expect(overallAccuracy(history)).toBe(75);
  });
});

describe('cumulativeMastered', () => {
  it('returns a running total of newly-mastered counts', () => {
    const history = [
      buildSessionRecord(summary({ newlyMastered: ['q1'] }), 'a', '1', NOW),
      buildSessionRecord(summary({ newlyMastered: [] }), 'b', '2', NOW),
      buildSessionRecord(summary({ newlyMastered: ['q2', 'q3'] }), 'c', '3', NOW),
    ];
    expect(cumulativeMastered(history)).toEqual([1, 1, 3]);
  });

  it('is empty for an empty history', () => {
    expect(cumulativeMastered([])).toEqual([]);
  });
});
