import { useRef } from 'react';
import { useSpreadsheet, type SpreadsheetHandle } from '@/hooks/useSpreadsheet';

interface SpreadsheetEditorProps {
  onReady: (handle: SpreadsheetHandle) => void;
}

export function SpreadsheetEditor({ onReady }: SpreadsheetEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handle = useSpreadsheet(containerRef);
  const readyReported = useRef(false);

  if (handle.isReady && !readyReported.current) {
    readyReported.current = true;
    onReady(handle);
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
    />
  );
}
