import { create } from 'zustand';

import type { SessionSummary } from '@/domain/mastery';

interface SessionState {
  lastSummary: SessionSummary | null;
  lastModeLabel: string;
  /** Segment d'URL du dernier mode joué, pour « Rejouer ». */
  lastModeParam: string;
  /** Vies restantes à la fin de la partie. 0 = partie perdue (plus de vies) ;
   *  > 0 = tout le pool a été parcouru sans épuiser les vies. */
  lastLivesLeft: number;
  setResult: (
    summary: SessionSummary,
    modeLabel: string,
    modeParam: string,
    livesLeft: number,
  ) => void;
  clear: () => void;
}

/** État de session, non persisté (repart de zéro à chaque lancement). */
export const useSessionStore = create<SessionState>((set) => ({
  lastSummary: null,
  lastModeLabel: '',
  lastModeParam: '',
  lastLivesLeft: 0,
  setResult: (lastSummary, lastModeLabel, lastModeParam, lastLivesLeft) =>
    set({ lastSummary, lastModeLabel, lastModeParam, lastLivesLeft }),
  clear: () => set({ lastSummary: null, lastModeLabel: '', lastModeParam: '', lastLivesLeft: 0 }),
}));
