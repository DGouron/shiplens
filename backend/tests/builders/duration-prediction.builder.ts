import { DurationPrediction } from '@modules/analytics/entities/duration-prediction/duration-prediction.js';
import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';

interface DurationPredictionBuilderProps {
  cycleTimes: number[];
}

const defaultProps: DurationPredictionBuilderProps = {
  cycleTimes: [2, 3, 4, 5, 6],
};

export class DurationPredictionBuilder extends EntityBuilder<
  DurationPredictionBuilderProps,
  DurationPrediction
> {
  constructor() {
    super(defaultProps);
  }

  withCycleTimes(cycleTimes: number[]): this {
    this.props.cycleTimes = cycleTimes;
    return this;
  }

  build(): DurationPrediction {
    return DurationPrediction.fromCycleTimes([...this.props.cycleTimes]);
  }
}
