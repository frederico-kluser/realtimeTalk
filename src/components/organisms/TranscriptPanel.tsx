import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MessageBubble, EmptyState } from '@/components/atoms';
import { useT } from '@/i18n';
import type { TranscriptEntry } from '@/storage/idb';

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
}

export function TranscriptPanel({ entries }: TranscriptPanelProps) {
  const t = useT();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState message={t.emptyTranscript} />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      {entries.map((entry, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <MessageBubble text={entry.text} role={entry.role} />
        </motion.div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
