import { useCallback } from 'react';
import type { RealtimeSessionHandle } from './useRealtimeSession';

export interface TemplateVariables {
  [key: string]: string | number | boolean;
}

function resolveTemplate(template: string, vars: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    return key in vars ? String(vars[key]) : `{{${key}}}`;
  });
}

export function useContextInjection(session: RealtimeSessionHandle) {
  const injectSystemContext = useCallback((text: string) => {
    session.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'system',
        content: [{ type: 'input_text', text }],
      },
    });
  }, [session]);

  const updateInstructions = useCallback((
    template: string,
    vars: TemplateVariables = {}
  ) => {
    const resolved = resolveTemplate(template, vars);
    session.sendEvent({
      type: 'session.update',
      session: { instructions: resolved },
    });
  }, [session]);

  const injectUserContext = useCallback((text: string) => {
    session.sendEvent({
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }],
      },
    });
  }, [session]);

  return { injectSystemContext, updateInstructions, injectUserContext };
}
