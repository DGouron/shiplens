import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';
import { StatusThreshold } from '@modules/analytics/entities/status-threshold/status-threshold.js';
import { type StatusThresholdProps } from '@modules/analytics/entities/status-threshold/status-threshold.schema.js';

const defaultProps: StatusThresholdProps = {
  id: 'threshold-1',
  statusName: 'In Review',
  thresholdHours: 48,
};

export class StatusThresholdBuilder extends EntityBuilder<
  StatusThresholdProps,
  StatusThreshold
> {
  constructor() {
    super(defaultProps);
  }

  withId(id: string): this {
    this.props.id = id;
    return this;
  }

  withStatusName(statusName: string): this {
    this.props.statusName = statusName;
    return this;
  }

  withThresholdHours(thresholdHours: number): this {
    this.props.thresholdHours = thresholdHours;
    return this;
  }

  build(): StatusThreshold {
    return StatusThreshold.create({ ...this.props });
  }
}
