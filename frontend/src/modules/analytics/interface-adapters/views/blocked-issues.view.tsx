import { SkeletonCard } from '@/components/skeleton-card.tsx';
import { type BlockedIssuesState } from '../hooks/use-blocked-issues.ts';
import { type BlockedIssuesTranslations } from '../presenters/blocked-issues.translations.ts';
import {
  type BlockedIssueItemViewModel,
  type BlockedIssuesViewModel,
} from '../presenters/blocked-issues.view-model.schema.ts';

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

interface BlockedIssuesReadyViewProps {
  viewModel: BlockedIssuesViewModel;
}

function BlockedIssuesReadyView({ viewModel }: BlockedIssuesReadyViewProps) {
  return (
    <div className="blocked-issues-content">
      {viewModel.emptyMessage !== null && (
        <p className="blocked-issues-empty" role="status">
          {viewModel.emptyMessage}
        </p>
      )}
      {viewModel.items.length > 0 && (
        <ul className="blocked-issues-list">
          {viewModel.items.map((item) => (
            <BlockedIssueItemView key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}

interface BlockedIssueItemViewProps {
  item: BlockedIssueItemViewModel;
}

function BlockedIssueItemView({ item }: BlockedIssueItemViewProps) {
  return (
    <li className="blocked-issues-item">
      <a
        className="blocked-issues-link"
        href={item.issueUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.issueTitle}
      </a>
      <span className="blocked-issues-status">{item.statusName}</span>
      <span className="blocked-issues-severity">{item.severityLabel}</span>
      <span className="blocked-issues-duration">{item.durationLabel}</span>
    </li>
  );
}
