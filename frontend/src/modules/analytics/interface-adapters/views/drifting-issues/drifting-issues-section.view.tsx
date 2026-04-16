import '@/styles/drifting-issues.css';
import { SkeletonCard } from '@/components/skeleton-card.tsx';
import { type DriftingIssuesState } from '../../hooks/use-drifting-issues.ts';
import { type DriftingIssuesTranslations } from '../../presenters/drifting-issues.translations.ts';
import { DriftingIssuesReadyView } from './drifting-issues-ready.view.tsx';

interface DriftingIssuesSectionViewProps {
  state: DriftingIssuesState;
  translations: DriftingIssuesTranslations;
  onMemberClick: (memberName: string) => void;
}

export function DriftingIssuesSectionView({
  state,
  translations,
  onMemberClick,
}: DriftingIssuesSectionViewProps) {
  return (
    <section
      className="cycle-report-section drifting-issues-section"
      data-section-id="drifting"
    >
      <h2>{translations.sectionTitle}</h2>
      {state.status === 'loading' && <SkeletonCard />}
      {state.status === 'error' && (
        <p className="drifting-issues-error">{state.message}</p>
      )}
      {state.status === 'ready' && (
        <DriftingIssuesReadyView
          viewModel={state.data}
          onMemberClick={onMemberClick}
        />
      )}
    </section>
  );
}
