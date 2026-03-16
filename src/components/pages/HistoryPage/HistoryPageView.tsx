import { motion } from 'motion/react';
import { PageLayout } from '@/components/templates/PageLayout';
import { AppHeader } from '@/components/organisms/AppHeader';
import { SessionCard } from '@/components/organisms/SessionCard';
import { Button } from '@/components/atoms/Button';
import { EmptyState } from '@/components/atoms/EmptyState';
import { useT } from '@/i18n';
import type { useHistoryController } from './useHistoryController';

type HistoryViewProps = ReturnType<typeof useHistoryController>;

export function HistoryPageView({
  sessions,
  expandedId,
  toggleExpanded,
  handleExport,
  handleImport,
  handleDeleteSession,
  handleResumeSession,
}: HistoryViewProps) {
  const t = useT();

  return (
    <PageLayout>
      <AppHeader title={t.sessionHistory} backTo="/">
        <Button variant="ghost" size="xs" onClick={() => void handleExport()}>
          {t.export}
        </Button>
        <Button variant="ghost" size="xs" onClick={() => void handleImport()}>
          {t.import}
        </Button>
      </AppHeader>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {sessions.length === 0 ? (
          <EmptyState message={t.noSessions} />
        ) : (
          sessions.map((session, i) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                delay: i * 0.04,
              }}
            >
              <SessionCard
                session={session}
                isExpanded={expandedId === session.id}
                onToggle={() => toggleExpanded(session.id)}
                onDelete={() => void handleDeleteSession(session.id)}
                onResume={() => handleResumeSession(session)}
              />
            </motion.div>
          ))
        )}
      </div>
    </PageLayout>
  );
}
