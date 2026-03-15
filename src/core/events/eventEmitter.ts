import type { ServerEvent, ServerEventType } from '@/core/types/realtime';

type Listener = (event: ServerEvent) => void;

export class TypedEventEmitter {
  private listeners = new Map<ServerEventType | '*', Set<Listener>>();

  on(type: ServerEventType | '*', listener: Listener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
    return () => this.off(type, listener);
  }

  off(type: ServerEventType | '*', listener: Listener): void {
    this.listeners.get(type)?.delete(listener);
  }

  emit(event: ServerEvent): void {
    this.listeners.get(event.type)?.forEach(fn => fn(event));
    this.listeners.get('*')?.forEach(fn => fn(event));
  }

  removeAll(): void {
    this.listeners.clear();
  }
}
