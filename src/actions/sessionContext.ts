import type { TutorReport } from '@/storage/idb';

export type CorrectionMode = 'immediate' | 'deferred';

let currentSessionId: string | null = null;
let pendingTutorReport: TutorReport | null = null;
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
    personalityPrompt = null;
    correctionMode = 'immediate';
    sendEventFn = null;
  },
};
