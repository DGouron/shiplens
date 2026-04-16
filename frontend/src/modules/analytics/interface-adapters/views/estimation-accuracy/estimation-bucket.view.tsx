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
      <div
        className="estimation-accuracy-bucket-bar"
        style={{ width: `${bucket.percentage}%` }}
      />
      <span className="estimation-accuracy-bucket-label">{bucket.label}</span>
    </li>
  );
}
