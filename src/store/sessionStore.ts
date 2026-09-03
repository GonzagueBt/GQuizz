import { create } from 'zustand';

import type { SessionSummary } from '@/domain/mastery';

interface SessionState {
  lastSummary: SessionSummary | null;
  lastModeLabel: string;
  /** Segment d'URL du dernier mode joué, pour « Rejouer ». */
  lastModeParam: string;
  setResult: (summary: SessionSummary, modeLabel: string, modeParam: string) => void;
  clear: () => void;
}

/** État de session, non persisté (repart de zéro à chaque lancement). */
export const useSessionStore = create<SessionState>((set) => ({
  lastSummary: null,
  lastModeLabel: '',
  lastModeParam: '',
  setResult: (lastSummary, lastModeLabel, lastModeParam) =>
    set({ lastSummary, lastModeLabel, lastModeParam }),
  clear: () => set({ lastSummary: null, lastModeLabel: '', lastModeParam: '' }),
}));
