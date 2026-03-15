import type { RealtimeModel, RealtimeVoice } from '@/core/types/realtime';

export interface EphemeralTokenResponse {
  id: string;
  client_secret: {
    value: string;
    expires_at: number;
  };
  model: string;
}

export async function createEphemeralToken(
  apiKey: string,
  config: { model: RealtimeModel; voice?: RealtimeVoice }
): Promise<EphemeralTokenResponse> {
  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: config.model,
      voice: config.voice ?? 'marin',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } })) as {
      error?: { message?: string };
    };
    throw new Error(
      error?.error?.message ?? `Failed to create ephemeral token: ${response.status}`
    );
  }

  return response.json() as Promise<EphemeralTokenResponse>;
}
