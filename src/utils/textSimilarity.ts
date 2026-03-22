/**
 * Text similarity utilities for pronunciation and dictation exercises.
 *
 * LIMITATION: Comparison is purely textual (based on transcribed text),
 * not phonetic. It detects swapped, omitted, or added words but cannot
 * assess actual phonetic accuracy (e.g., accent quality, vowel length).
 * The WebRTC transcription quality is the upper bound of precision.
 */

/**
 * Normalize a string for comparison: lowercase, strip punctuation, collapse whitespace.
 */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritical marks (accent tolerance)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compute the Levenshtein distance (minimum edit distance) between two strings.
 * Uses O(min(m,n)) space via a single-row DP approach.
 */
export function levenshteinDistance(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);

  if (na === nb) return 0;
  if (na.length === 0) return nb.length;
  if (nb.length === 0) return na.length;

  // Ensure `short` is the shorter string for O(min(m,n)) space
  const [short, long] =
    na.length <= nb.length ? [na, nb] : [nb, na];

  const shortLen = short.length;
  const longLen = long.length;

  let prev = Array.from({ length: shortLen + 1 }, (_, i) => i);
  let curr = new Array<number>(shortLen + 1);

  for (let i = 1; i <= longLen; i++) {
    curr[0] = i;
    for (let j = 1; j <= shortLen; j++) {
      const cost = long[i - 1] === short[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        prev[j] + 1,       // deletion
        curr[j - 1] + 1,   // insertion
        prev[j - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[shortLen];
}

/**
 * Compute a similarity score between 0 and 1.
 * 1 = identical, 0 = completely different.
 */
export function similarityScore(expected: string, spoken: string): number {
  const ne = normalize(expected);
  const ns = normalize(spoken);

  if (ne === ns) return 1;

  const maxLen = Math.max(ne.length, ns.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(ne, ns);
  return 1 - distance / maxLen;
}

/**
 * Find words in `expected` that differ from `spoken`.
 * Returns an array of problematic words (missing, swapped, or misheard).
 *
 * Strategy: compare word-by-word using the longest common subsequence (LCS)
 * to identify which expected words are absent from the spoken version.
 */
export function findDifferences(
  expected: string,
  spoken: string,
): string[] {
  const expectedWords = normalize(expected).split(' ').filter(Boolean);
  const spokenWords = normalize(spoken).split(' ').filter(Boolean);

  if (expectedWords.length === 0) return [];

  // Build LCS table to find matching words
  const m = expectedWords.length;
  const n = spokenWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (expectedWords[i - 1] === spokenWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find which expected words are NOT in the LCS
  const matched = new Set<number>();
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (expectedWords[i - 1] === spokenWords[j - 1]) {
      matched.add(i - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return expectedWords.filter((_, idx) => !matched.has(idx));
}
