import type { TranscriptEntry } from '@/storage/idb';

/**
 * Detects whether an exercise (quiz, pronunciation, dictation) is currently
 * active based on recent assistant messages in the transcript.
 *
 * When an exercise is active, VAD should be less aggressive to prevent
 * false-positive speech detection from interrupting the AI mid-question.
 */
export function detectExerciseActive(transcript: TranscriptEntry[]): boolean {
  if (transcript.length === 0) return false;

  const recentAssistant = transcript
    .filter((t) => t.role === 'assistant')
    .slice(-3);

  for (let i = recentAssistant.length - 1; i >= 0; i--) {
    const entry = recentAssistant[i];
    if (!entry) continue;
    const text = entry.text;

    // Multiple choice: A) / A: / A. patterns with 3+ options
    const mcPattern = /(?:^|\n)\s*[A-D][):.]\s*.+/gm;
    const mcMatches = text.match(mcPattern);
    if (mcMatches && mcMatches.length >= 3) return true;

    // Pronunciation exercise
    if (/(?:repeat after me|say this|repeat this|try saying)[:\s]/i.test(text)) return true;

    // Dictation exercise
    if (/(?:write down|type what you hear|listen and repeat|here is your dictation)[:\s]/i.test(text)) return true;

    // Vocabulary quiz indicators
    if (/(?:what does .+ mean|translate .+ to|how do you say .+ in)/i.test(text)) return true;

    // Generic quiz/exercise framing
    if (/(?:question \d|next word|your turn|what's the answer)/i.test(text)) return true;
  }

  // Check if the last user message was a single letter (quiz answer)
  const lastUser = transcript.filter((t) => t.role === 'user').slice(-1)[0];
  if (lastUser && /^[A-Da-d]$/i.test(lastUser.text.trim())) return true;

  return false;
}
