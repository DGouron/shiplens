import { type DurationPredictionProps } from './duration-prediction.schema.js';
import { durationPredictionGuard } from './duration-prediction.guard.js';

type Confidence = 'high' | 'low';

const LOW_CONFIDENCE_THRESHOLD = 5;

function percentile(sortedValues: number[], percent: number): number {
  if (sortedValues.length === 1) return sortedValues[0];

  const position = (percent / 100) * (sortedValues.length - 1);
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);

  if (lowerIndex === upperIndex) return sortedValues[lowerIndex];

  const fraction = position - lowerIndex;
  return sortedValues[lowerIndex] + fraction * (sortedValues[upperIndex] - sortedValues[lowerIndex]);
}

export class DurationPrediction {
  private constructor(private readonly props: DurationPredictionProps) {}

  static fromCycleTimes(cycleTimes: number[]): DurationPrediction {
    const sorted = [...cycleTimes].sort((a, b) => a - b);

    const props = {
      optimistic: percentile(sorted, 25),
      probable: percentile(sorted, 50),
      pessimistic: percentile(sorted, 75),
      similarIssueCount: cycleTimes.length,
    };

    const validatedProps = durationPredictionGuard.parse(props);
    return new DurationPrediction(validatedProps);
  }

  get optimistic(): number {
    return this.props.optimistic;
  }

  get probable(): number {
    return this.props.probable;
  }

  get pessimistic(): number {
    return this.props.pessimistic;
  }

  get similarIssueCount(): number {
    return this.props.similarIssueCount;
  }

  get confidence(): Confidence {
    return this.props.similarIssueCount >= LOW_CONFIDENCE_THRESHOLD ? 'high' : 'low';
  }
}
