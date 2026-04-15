import { type EstimationDonutViewModel } from '../../presenters/estimation-accuracy.view-model.schema.ts';
import { EstimationBucketView } from './estimation-bucket.view.tsx';

interface EstimationDonutViewProps {
  donut: EstimationDonutViewModel;
}

export function EstimationDonutView({ donut }: EstimationDonutViewProps) {
  return (
    <div className="estimation-accuracy-donut">
      <p className="estimation-accuracy-total">{donut.totalLabel}</p>
      <ul className="estimation-accuracy-buckets">
        <EstimationBucketView bucket={donut.wellEstimated} variant="well" />
        <EstimationBucketView bucket={donut.overEstimated} variant="over" />
        <EstimationBucketView bucket={donut.underEstimated} variant="under" />
      </ul>
    </div>
  );
}
