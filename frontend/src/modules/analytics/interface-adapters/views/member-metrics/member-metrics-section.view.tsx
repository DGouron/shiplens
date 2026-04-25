import { SkeletonCard } from '@/components/skeleton-card.tsx';
import { type MemberMetricsState } from '../../hooks/use-member-metrics.ts';
import { MemberMetricsCardsView } from './member-metrics-cards.view.tsx';

interface MemberMetricsSectionViewProps {
  state: MemberMetricsState;
  title: string;
}

export function MemberMetricsSectionView({
  state,
  title,
}: MemberMetricsSectionViewProps) {
  return (
    <section
      className="cycle-report-section cycle-metrics-section"
      data-section-id="member-metrics"
    >
      <h2>{title}</h2>
      {state.status === 'loading' && <SkeletonCard />}
      {state.status === 'error' && (
        <p className="cycle-metrics-error">{state.message}</p>
      )}
      {state.status === 'ready' && (
        <MemberMetricsCardsView viewModel={state.data} />
      )}
    </section>
  );
}
