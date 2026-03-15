const TOKEN_LIMIT = 32_000;
const SUMMARY_THRESHOLD = 0.85;

export class ContextWindowManager {
  private tokenCount = 0;
  private itemIds: string[] = [];

  updateCount(totalTokens: number): void {
    this.tokenCount = totalTokens;
  }

  getTokenCount(): number {
    return this.tokenCount;
  }

  trackItem(itemId: string): void {
    this.itemIds.push(itemId);
  }

  shouldSummarize(): boolean {
    return this.tokenCount > TOKEN_LIMIT * SUMMARY_THRESHOLD;
  }

  async pruneOldTurns(
    session: { sendEvent: (e: unknown) => void },
    keepLast = 5
  ): Promise<void> {
    if (this.itemIds.length <= keepLast) return;
    const toDelete = this.itemIds.slice(0, this.itemIds.length - keepLast);
    for (const itemId of toDelete) {
      session.sendEvent({
        type: 'conversation.item.delete',
        item_id: itemId,
      });
    }
    this.itemIds = this.itemIds.slice(-keepLast);
  }

  async summarizeTurns(
    apiKey: string,
    transcript: string
  ): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Summarize the following conversation turns concisely, preserving key facts and context.',
          },
          { role: 'user', content: transcript },
        ],
        max_tokens: 500,
      }),
    });
    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return data.choices[0]?.message.content ?? '';
  }
}
