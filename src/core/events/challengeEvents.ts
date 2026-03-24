export type ChallengeType = 'multiple_choice' | 'vocabulary' | 'pronunciation' | 'dictation' | 'flashcard';

export interface Challenge {
  id: string;
  type: ChallengeType;
  question: string;
  options?: string[];
  correctIndex?: number;
  targetText?: string;
  hint?: string;
  metadata?: Record<string, unknown>;
}

type ChallengeListener = (challenge: Challenge) => void;
type DismissListener = () => void;

const challengeListeners = new Set<ChallengeListener>();
const dismissListeners = new Set<DismissListener>();

export function emitChallenge(challenge: Challenge) {
  challengeListeners.forEach((fn) => fn(challenge));
}

export function emitDismissChallenge() {
  dismissListeners.forEach((fn) => fn());
}

export function onChallenge(fn: ChallengeListener) {
  challengeListeners.add(fn);
}

export function offChallenge(fn: ChallengeListener) {
  challengeListeners.delete(fn);
}

export function onDismissChallenge(fn: DismissListener) {
  dismissListeners.add(fn);
}

export function offDismissChallenge(fn: DismissListener) {
  dismissListeners.delete(fn);
}
