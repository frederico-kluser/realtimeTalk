import { useEffect, useRef } from 'react';
import { MessageBubble, EmptyState } from '@/components/atoms';
import type { TranscriptEntry } from '@/storage/idb';

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

export function TranscriptPanel({ entries }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState message="Start speaking to begin a conversation..." />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {entries.map((entry, i) => (
        <MessageBubble key={i} text={entry.text} role={entry.role} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
