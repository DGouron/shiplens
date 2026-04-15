import { SkeletonCard } from '@/components/skeleton-card.tsx';
import { type CycleMetricsState } from '../hooks/use-cycle-metrics.ts';
import { type CycleMetricsTranslations } from '../presenters/cycle-metrics.translations.ts';
import {
  type CycleMetricsCardViewModel,
  type CycleMetricsViewModel,
} from '../presenters/cycle-metrics.view-model.schema.ts';

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

interface CycleMetricsCardsViewProps {
  viewModel: CycleMetricsViewModel;
  scopeCreepAlertLabel: string;
}

function CycleMetricsCardsView({
  viewModel,
  scopeCreepAlertLabel,
}: CycleMetricsCardsViewProps) {
  return (
    <div className="cycle-metrics-grid">
      {viewModel.cards.map((card) => (
        <CycleMetricsCardView
          key={card.id}
          card={card}
          scopeCreepAlertLabel={scopeCreepAlertLabel}
        />
      ))}
    </div>
  );
}

interface CycleMetricsCardViewProps {
  card: CycleMetricsCardViewModel;
  scopeCreepAlertLabel: string;
}

function CycleMetricsCardView({
  card,
  scopeCreepAlertLabel,
}: CycleMetricsCardViewProps) {
  const className = card.isAlert
    ? 'cycle-metrics-card cycle-metrics-card--alert'
    : 'cycle-metrics-card';
  const alertProps = card.isAlert
    ? { role: 'alert', 'aria-label': scopeCreepAlertLabel }
    : {};
  return (
    <div className={className} data-card-id={card.id} {...alertProps}>
      <span className="cycle-metrics-card__label">{card.label}</span>
      <span className="cycle-metrics-card__value">{card.value}</span>
    </div>
  );
}
