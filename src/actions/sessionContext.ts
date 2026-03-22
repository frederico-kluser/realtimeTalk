import type { TutorReport } from '@/storage/idb';

let currentSessionId: string | null = null;
let pendingTutorReport: TutorReport | null = null;

export const sessionContext = {
  setSessionId: (id: string) => {
    currentSessionId = id;
  },
  getSessionId: () => currentSessionId,
  setTutorReport: (report: TutorReport) => {
    pendingTutorReport = report;
  },
  getTutorReport: () => pendingTutorReport,
  clear: () => {
    currentSessionId = null;
    pendingTutorReport = null;
  },
};
