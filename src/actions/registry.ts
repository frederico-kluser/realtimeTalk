import { z } from 'zod';
import type { ToolDefinition } from '@/core/types/realtime';

export type ActionType = 'conversational' | 'background';

export interface ActionDefinition {
  description: string;
  parameters: z.ZodObject;
  type?: ActionType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (params: any) => Promise<unknown>;
}

export interface ActionRegistry {
  actions: Record<string, ActionDefinition>;
  getToolDefinitions: () => ToolDefinition[];
  execute: (name: string, argsJson: string) => Promise<{ result: unknown; type: ActionType }>;
}

export function createActionRegistry(
  definitions: Record<string, ActionDefinition>
): ActionRegistry {
  const getToolDefinitions = (): ToolDefinition[] =>
    Object.entries(definitions).map(([name, def]) => {
      const jsonSchema = z.toJSONSchema(def.parameters) as Record<string, unknown>;
      // Remove $schema since OpenAI doesn't want it
      const { $schema: _, ...params } = jsonSchema;
      return {
        type: 'function' as const,
        name,
        description: def.description,
        parameters: params,
      };
    });

  const execute = async (
    name: string,
    argsJson: string
  ): Promise<{ result: unknown; type: ActionType }> => {
    const def = definitions[name];
    if (!def) throw new Error(`Unknown action: ${name}`);

    const parsed = def.parameters.parse(JSON.parse(argsJson)) as Record<string, unknown>;
    const result = await def.handler(parsed);
    return { result, type: def.type ?? 'conversational' };
  };

  return { actions: definitions, getToolDefinitions, execute };
}
