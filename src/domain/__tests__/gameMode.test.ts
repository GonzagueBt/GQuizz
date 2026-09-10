import { gameModeToParam, parseGameMode } from '../gameMode';
import type { GameMode } from '../types';

describe('gameModeToParam / parseGameMode', () => {
  const cases: GameMode[] = [
    { kind: 'global' },
    { kind: 'deck', deckId: 'histoire-de-france' },
    { kind: 'daily', date: '2026-09-10' },
    { kind: 'event', eventId: 'noel-2026' },
  ];

  it.each(cases)('round-trips %j through the URL param', (mode) => {
    expect(parseGameMode(gameModeToParam(mode))).toEqual(mode);
  });

  it('encodes a deck id containing a colon-free slug', () => {
    expect(gameModeToParam({ kind: 'deck', deckId: 'sport' })).toBe('deck:sport');
  });

  it('falls back to global for an unrecognized param', () => {
    expect(parseGameMode('anything-else')).toEqual({ kind: 'global' });
  });
});
