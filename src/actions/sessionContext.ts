import type { TutorReport } from '@/storage/idb';
import type { ScenarioId, ScenarioDifficulty } from '@/personality/scenarios';

export interface RoleplayState {
  readonly scenarioId: ScenarioId;
  readonly difficulty: ScenarioDifficulty;
  readonly startedAt: string;
}

let currentSessionId: string | null = null;
let pendingTutorReport: TutorReport | null = null;
let activeRoleplay: RoleplayState | null = null;

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
  clear: () => {
    currentSessionId = null;
    pendingTutorReport = null;
    activeRoleplay = null;
  },
};
