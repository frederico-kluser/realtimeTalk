import { useCallback } from 'react';
import { getDB } from '@/storage/idb';
import { apiKeyManager } from '@/storage/keyManager';

export function useMemory() {
  const loadAndInjectMemories = useCallback(async (
    sendEvent: (e: Record<string, unknown>) => void
  ) => {
    const db = await getDB();
    const memories = await db.getAll('memories');
    if (memories.length === 0) return;

    const recent = memories
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 20);

    const memoryText = recent
      .map(m => `- ${m.fact}`)
      .join('\n');

    const injection = `\n\n# MEMORIES FROM PREVIOUS SESSIONS\nThe user mentioned in previous conversations:\n${memoryText}\n\nUse this information to personalize responses when relevant.`;

    sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'system',
        content: [{ type: 'input_text', text: injection }],
      },
    });
  }, []);

  const extractAndSaveFacts = useCallback(async (
    sessionId: string,
    transcript: string
  ) => {
    if (!apiKeyManager.hasKey() || transcript.length < 50) return;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeyManager.get()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Extract 3-5 specific facts about the user from this conversation that would be useful to remember in future conversations. Include grammar error patterns if this is a language learning session (e.g. "The user struggles with irregular past tense verbs", "The user frequently confuses subject-verb agreement"). Return a JSON object with a "facts" key containing an array of strings. Each fact should be a complete sentence starting with "The user". Return only the JSON object.',
            },
            { role: 'user', content: transcript },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 400,
        }),
      });

      const data = await response.json() as { choices: Array<{ message: { content: string } }> };
      const content = data.choices[0]?.message.content ?? '{"facts":[]}';
      const parsed = JSON.parse(content) as { facts?: string[] };
      const facts = parsed.facts ?? [];

      const db = await getDB();
      for (const fact of facts) {
        await db.put('memories', {
          id: crypto.randomUUID(),
          fact,
          source: sessionId,
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      // Silent failure — memory extraction is best-effort
    }
  }, []);

  return { loadAndInjectMemories, extractAndSaveFacts };
}
