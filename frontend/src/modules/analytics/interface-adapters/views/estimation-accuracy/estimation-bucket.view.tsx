import { type EstimationBucketViewModel } from '../../presenters/estimation-accuracy.view-model.schema.ts';

interface EstimationBucketViewProps {
  bucket: EstimationBucketViewModel;
  variant: 'well' | 'over' | 'under';
}

export function EstimationBucketView({
  bucket,
  variant,
}: EstimationBucketViewProps) {
  return (
    <li
      className={`estimation-accuracy-bucket estimation-accuracy-bucket--${variant}`}
    >
      {bucket.label}
    </li>
  );
}
