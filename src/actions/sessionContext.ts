import type { TutorReport } from '@/storage/idb';
import type { ScenarioId, ScenarioDifficulty } from '@/personality/scenarios';

export interface RoleplayState {
  readonly scenarioId: ScenarioId;
  readonly difficulty: ScenarioDifficulty;
  readonly startedAt: string;
}

export type CorrectionMode = 'immediate' | 'deferred';

let currentSessionId: string | null = null;
let pendingTutorReport: TutorReport | null = null;
let activeRoleplay: RoleplayState | null = null;
let personalityPrompt: string | null = null;
let correctionMode: CorrectionMode = 'immediate';
let sendEventFn: ((event: Record<string, unknown>) => void) | null = null;

export const sessionContext = {
  setSessionId: (id: string) => {
    currentSessionId = id;
  },
  getSessionId: () => currentSessionId,
  setTutorReport: (report: TutorReport) => {
    pendingTutorReport = report;
  },
  getTutorReport: () => pendingTutorReport,
  setRoleplayState: (state: RoleplayState) => {
    activeRoleplay = state;
  },
  getRoleplayState: () => activeRoleplay,
  clearRoleplayState: () => {
    activeRoleplay = null;
  },
  setPersonalityPrompt: (prompt: string) => {
    personalityPrompt = prompt;
  },
  getPersonalityPrompt: () => personalityPrompt,
  setCorrectionMode: (mode: CorrectionMode) => {
    correctionMode = mode;
  },
  getCorrectionMode: () => correctionMode,
  setSendEvent: (fn: (event: Record<string, unknown>) => void) => {
    sendEventFn = fn;
  },
  sendEvent: (event: Record<string, unknown>) => {
    sendEventFn?.(event);
  },
  clear: () => {
    currentSessionId = null;
    pendingTutorReport = null;
    activeRoleplay = null;
    personalityPrompt = null;
    correctionMode = 'immediate';
    sendEventFn = null;
  },
};
