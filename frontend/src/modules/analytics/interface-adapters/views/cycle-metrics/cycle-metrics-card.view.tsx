import { type CycleMetricsCardViewModel } from '../../presenters/cycle-metrics.view-model.schema.ts';

interface CycleMetricsCardViewProps {
  card: CycleMetricsCardViewModel;
  scopeCreepAlertLabel: string;
}

export function CycleMetricsCardView({
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
