import { motion, AnimatePresence } from 'motion/react';
import { PageLayout } from '@/components/templates/PageLayout';
import { ContentLayout } from '@/components/templates/ContentLayout';
import { AppHeader } from '@/components/organisms/AppHeader';
import { ChevronDownIcon } from '@/components/atoms/icons';
import { useT } from '@/i18n';
import type { useFaqController } from './useFaqController';

type FaqViewProps = ReturnType<typeof useFaqController>;

export function FaqPageView({ expandedIndex, toggleExpanded }: FaqViewProps) {
  const t = useT();

  return (
    <PageLayout>
      <AppHeader title={t.faqTitle} backTo="/" />

      <ContentLayout maxWidth="lg">
        <div className="space-y-3">
          {t.faqItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                delay: i * 0.05,
              }}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleExpanded(i)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white pr-4">
                  {item.question}
                </span>
                <motion.div
                  animate={{ rotate: expandedIndex === i ? 180 : 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="shrink-0"
                >
                  <ChevronDownIcon />
                </motion.div>
              </button>

              <AnimatePresence>
                {expandedIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-700/50">
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </ContentLayout>
    </PageLayout>
  );
}
