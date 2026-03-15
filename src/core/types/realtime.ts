export type RealtimeModel =
  | 'gpt-realtime'
  | 'gpt-realtime-mini'
  | 'gpt-realtime-1.5';

export type RealtimeVoice =
  | 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo'
  | 'sage' | 'shimmer' | 'verse' | 'marin' | 'cedar';

export type VADEagerness = 'auto' | 'low' | 'medium' | 'high';

export interface TurnDetection {
  type: 'semantic_vad';
  eagerness?: VADEagerness;
  create_response?: boolean;
  interrupt_response?: boolean;
}

export interface SessionConfig {
  model: RealtimeModel;
  instructions?: string;
  voice?: RealtimeVoice;
  output_modalities?: ('audio' | 'text')[];
  tools?: ToolDefinition[];
  tool_choice?: 'auto' | 'none' | 'required';
  temperature?: number;
  turn_detection?: TurnDetection | null;
}

export interface ToolDefinition {
  type: 'function';
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// ─── Server Events ───────────────────────────────────────────────────

export type ServerEventType =
  | 'session.created'
  | 'session.updated'
  | 'input_audio_buffer.speech_started'
  | 'input_audio_buffer.speech_stopped'
  | 'response.created'
  | 'response.done'
  | 'response.function_call_arguments.delta'
  | 'response.function_call_arguments.done'
  | 'response.output_text.delta'
  | 'conversation.item.created'
  | 'input_audio_buffer.committed'
  | 'output_audio_buffer.cleared'
  | 'error';

export interface ServerEvent {
  type: ServerEventType;
  event_id?: string;
  [key: string]: unknown;
}

export interface ResponseDoneEvent extends ServerEvent {
  type: 'response.done';
  response: {
    id: string;
    status: 'completed' | 'cancelled' | 'failed';
    output: ResponseOutputItem[];
    usage?: {
      total_tokens: number;
      input_tokens: number;
      output_tokens: number;
    };
  };
}

export interface ResponseOutputItem {
  id: string;
  type: 'message' | 'function_call';
  name?: string;
  call_id?: string;
  arguments?: string;
  content?: Array<{ type: string; transcript?: string; text?: string }>;
}

export interface FunctionCallArgumentsDoneEvent extends ServerEvent {
  type: 'response.function_call_arguments.done';
  item_id: string;
  call_id: string;
  name: string;
  arguments: string;
}

// ─── Client Events ───────────────────────────────────────────────────

export interface SessionUpdateEvent {
  type: 'session.update';
  session: Partial<SessionConfig>;
}

export interface ConversationItemCreateEvent {
  type: 'conversation.item.create';
  item: ConversationItem;
}

export interface ConversationItem {
  type: 'message' | 'function_call_output';
  role?: 'user' | 'assistant' | 'system';
  content?: Array<{ type: 'input_text' | 'input_audio'; text?: string; audio?: string }>;
  call_id?: string;
  output?: string;
}

export interface ResponseCreateEvent {
  type: 'response.create';
  response?: { output_modalities?: ('audio' | 'text')[]; conversation?: string };
}
