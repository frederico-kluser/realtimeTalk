import { useCallback, useRef, useState } from 'react';
import type { ActionRegistry } from '@/actions/registry';
import type { RealtimeSessionHandle } from './useRealtimeSession';
import type { ResponseDoneEvent } from '@/core/types/realtime';

export interface ActionLogEntry {
  id: string;
  timestamp: string;
  name: string;
  args: unknown;
  result: unknown;
  type: 'conversational' | 'background';
  durationMs: number;
}

export function useActionRegistry(
  registry: ActionRegistry,
  session: RealtimeSessionHandle
) {
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const logRef = useRef<ActionLogEntry[]>([]);
  const executedCallIds = useRef(new Set<string>());

  const syncTools = useCallback(() => {
    session.sendEvent({
      type: 'session.update',
      session: {
        tools: registry.getToolDefinitions(),
        tool_choice: 'auto',
      },
    });
  }, [registry, session]);

  const handleResponseDone = useCallback(async (event: ResponseDoneEvent) => {
    const functionCalls = event.response.output.filter(
      (item) => item.type === 'function_call' && item.name && item.call_id && item.arguments
    );

    for (const call of functionCalls) {
      if (executedCallIds.current.has(call.call_id!)) continue;
      executedCallIds.current.add(call.call_id!);

      const start = performance.now();
      try {
        const { result, type } = await registry.execute(call.name!, call.arguments!);
        const durationMs = performance.now() - start;

        const logEntry: ActionLogEntry = {
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          name: call.name!,
          args: JSON.parse(call.arguments!),
          result,
          type,
          durationMs,
        };
        logRef.current = [logEntry, ...logRef.current].slice(0, 50);
        setActionLog([...logRef.current]);

        // Side-effect: inject immersion instructions into the session
        if (call.name === 'toggle_immersion_mode') {
          const immResult = result as { _immersionInstructions?: string };
          if (immResult._immersionInstructions) {
            session.sendEvent({
              type: 'conversation.item.create',
              item: {
                type: 'message',
                role: 'system',
                content: [{ type: 'input_text', text: immResult._immersionInstructions }],
              },
            });
          }
        }

        if (type === 'background') continue;

        session.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: call.call_id,
            output: JSON.stringify(result),
          },
        });
        session.sendEvent({ type: 'response.create' });
      } catch (err) {
        session.sendEvent({
          type: 'conversation.item.create',
          item: {
            type: 'function_call_output',
            call_id: call.call_id,
            output: JSON.stringify({ error: (err as Error).message }),
          },
        });
        session.sendEvent({ type: 'response.create' });
      }
    }
  }, [registry, session]);

  return { actionLog, syncTools, handleResponseDone };
}
