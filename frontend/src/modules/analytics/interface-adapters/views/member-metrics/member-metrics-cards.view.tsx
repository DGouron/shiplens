import { type MemberMetricsViewModel } from '../../presenters/member-metrics.view-model.schema.ts';
import { MemberMetricsCardView } from './member-metrics-card.view.tsx';

interface MemberMetricsCardsViewProps {
  viewModel: MemberMetricsViewModel;
}

export function MemberMetricsCardsView({
  viewModel,
}: MemberMetricsCardsViewProps) {
  return (
    <div className="cycle-metrics-grid">
      {viewModel.cards.map((card) => (
        <MemberMetricsCardView key={card.id} card={card} />
      ))}
    </div>
  );
}
