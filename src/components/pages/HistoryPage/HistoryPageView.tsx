import { PageLayout } from '@/components/templates/PageLayout';
import { AppHeader } from '@/components/organisms/AppHeader';
import { SessionCard } from '@/components/organisms/SessionCard';
import { Button } from '@/components/atoms/Button';
import { EmptyState } from '@/components/atoms/EmptyState';
import type { useHistoryController } from './useHistoryController';

type HistoryViewProps = ReturnType<typeof useHistoryController>;

export function HistoryPageView({
  sessions,
  expandedId,
  toggleExpanded,
  handleExport,
  handleImport,
  handleDeleteSession,
}: HistoryViewProps) {
  return (
    <PageLayout>
      <AppHeader title="Session History" backTo="/">
        <Button variant="ghost" size="xs" onClick={() => void handleExport()}>
          Export
        </Button>
        <Button variant="ghost" size="xs" onClick={() => void handleImport()}>
          Import
        </Button>
      </AppHeader>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {sessions.length === 0 ? (
          <EmptyState message="No sessions yet. Start a conversation!" />
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isExpanded={expandedId === session.id}
              onToggle={() => toggleExpanded(session.id)}
              onDelete={() => void handleDeleteSession(session.id)}
            />
          ))
        )}
      </div>
    </PageLayout>
  );
}
