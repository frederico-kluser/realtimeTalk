import type { TutorReport } from '@/storage/idb';
import type { ScenarioId, ScenarioDifficulty } from '@/personality/scenarios';
import type { VADEagerness } from '@/core/types/realtime';

export interface RoleplayState {
  readonly scenarioId: ScenarioId;
  readonly difficulty: ScenarioDifficulty;
  readonly startedAt: string;
}

export type CorrectionMode = 'immediate' | 'deferred';

/** Activities that require careful VAD to avoid false interruptions */
export type ActiveExercise =
  | 'vocabulary_quiz'
  | 'multiple_choice_quiz'
  | 'pronunciation'
  | 'dictation'
  | 'placement_test'
  | null;

let currentSessionId: string | null = null;
let pendingTutorReport: TutorReport | null = null;
let activeRoleplay: RoleplayState | null = null;
let personalityPrompt: string | null = null;
let correctionMode: CorrectionMode = 'immediate';
let sendEventFn: ((event: Record<string, unknown>) => void) | null = null;
let activeExercise: ActiveExercise = null;
let baseVadEagerness: VADEagerness = 'medium';

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

  // ─── Exercise-aware VAD ─────────────────────────────────────────────
  setBaseVadEagerness: (eagerness: VADEagerness) => {
    baseVadEagerness = eagerness;
  },
  getBaseVadEagerness: () => baseVadEagerness,

  /**
   * Enter careful VAD mode for an exercise (quiz, dictation, pronunciation).
   * Sets eagerness to 'low' and disables interrupt_response so background
   * noise or silence doesn't cut off the AI mid-question.
   */
  startExercise: (exercise: NonNullable<ActiveExercise>) => {
    activeExercise = exercise;
    sendEventFn?.({
      type: 'session.update',
      session: {
        turn_detection: {
          type: 'semantic_vad',
          eagerness: 'low',
          create_response: true,
          interrupt_response: false,
        },
      },
    });
  },

  /**
   * Exit careful VAD mode: restore the user's original eagerness and
   * re-enable interrupt_response for normal conversation flow.
   */
  endExercise: () => {
    activeExercise = null;
    sendEventFn?.({
      type: 'session.update',
      session: {
        turn_detection: {
          type: 'semantic_vad',
          eagerness: baseVadEagerness,
          create_response: true,
          interrupt_response: true,
        },
      },
    });
  },

  getActiveExercise: () => activeExercise,

  clear: () => {
    currentSessionId = null;
    pendingTutorReport = null;
    activeRoleplay = null;
    personalityPrompt = null;
    correctionMode = 'immediate';
    sendEventFn = null;
    activeExercise = null;
    baseVadEagerness = 'medium';
  },
};
