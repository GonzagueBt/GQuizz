import type { GameMode } from './types';

/** Encode/décode un GameMode dans un segment d'URL expo-router (`/play/[mode]`). */
export function parseGameMode(param: string): GameMode {
  if (param.startsWith('deck:')) return { kind: 'deck', deckId: param.slice(5) };
  if (param.startsWith('daily:')) return { kind: 'daily', date: param.slice(6) };
  if (param.startsWith('event:')) return { kind: 'event', eventId: param.slice(6) };
  return { kind: 'global' };
}

export function gameModeToParam(mode: GameMode): string {
  switch (mode.kind) {
    case 'global':
      return 'global';
    case 'deck':
      return `deck:${mode.deckId}`;
    case 'daily':
      return `daily:${mode.date}`;
    case 'event':
      return `event:${mode.eventId}`;
  }
}
