import { type MemberMetricsCardViewModel } from '../../presenters/member-metrics.view-model.schema.ts';

interface MemberMetricsCardViewProps {
  card: MemberMetricsCardViewModel;
}

export function MemberMetricsCardView({ card }: MemberMetricsCardViewProps) {
  const className = `cycle-metrics-card cycle-metrics-card--signal-${card.signal}`;
  return (
    <div className={className} data-card-id={card.id}>
      <span className="cycle-metrics-card__label">{card.label}</span>
      <span className="cycle-metrics-card__value">{card.value}</span>
      {card.caption !== null && (
        <span className="cycle-metrics-card__caption">{card.caption}</span>
      )}
    </div>
  );
}
