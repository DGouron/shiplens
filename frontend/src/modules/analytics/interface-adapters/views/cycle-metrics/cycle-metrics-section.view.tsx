import '@/styles/cycle-metrics.css';
import { SkeletonCard } from '@/components/skeleton-card.tsx';
import { type CycleMetricsState } from '../../hooks/use-cycle-metrics.ts';
import { type CycleMetricsTranslations } from '../../presenters/cycle-metrics.translations.ts';
import { CycleMetricsCardsView } from './cycle-metrics-cards.view.tsx';

interface CycleMetricsSectionViewProps {
  state: CycleMetricsState;
  translations: CycleMetricsTranslations;
}

export function CycleMetricsSectionView({
  state,
  translations,
}: CycleMetricsSectionViewProps) {
  return (
    <section
      className="cycle-report-section cycle-metrics-section"
      data-section-id="metrics"
    >
      <h2>{translations.sectionTitle}</h2>
      {state.status === 'loading' && <SkeletonCard />}
      {state.status === 'error' && (
        <p className="cycle-metrics-error">{state.message}</p>
      )}
      {state.status === 'ready' && (
        <CycleMetricsCardsView
          viewModel={state.data}
          scopeCreepAlertLabel={translations.scopeCreepAlert}
        />
      )}
    </section>
  );
}
