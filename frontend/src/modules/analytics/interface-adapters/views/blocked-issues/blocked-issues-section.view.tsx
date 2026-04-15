import { SkeletonCard } from '@/components/skeleton-card.tsx';
import { type BlockedIssuesState } from '../../hooks/use-blocked-issues.ts';
import { type BlockedIssuesTranslations } from '../../presenters/blocked-issues.translations.ts';
import { BlockedIssuesReadyView } from './blocked-issues-ready.view.tsx';

interface BlockedIssuesSectionViewProps {
  state: BlockedIssuesState;
  translations: BlockedIssuesTranslations;
}

export function BlockedIssuesSectionView({
  state,
  translations,
}: BlockedIssuesSectionViewProps) {
  return (
    <section
      className="cycle-report-section blocked-issues-section"
      data-section-id="blocked"
    >
      <h2>{translations.sectionTitle}</h2>
      {state.status === 'loading' && <SkeletonCard />}
      {state.status === 'error' && (
        <p className="blocked-issues-error">{state.message}</p>
      )}
      {state.status === 'ready' && (
        <BlockedIssuesReadyView viewModel={state.data} />
      )}
    </section>
  );
}
