import { type CycleMetricsViewModel } from '../../presenters/cycle-metrics.view-model.schema.ts';
import { CycleMetricsCardView } from './cycle-metrics-card.view.tsx';

interface CycleMetricsCardsViewProps {
  viewModel: CycleMetricsViewModel;
  scopeCreepAlertLabel: string;
}

export function CycleMetricsCardsView({
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
