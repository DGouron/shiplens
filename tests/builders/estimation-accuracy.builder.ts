import { EstimationAccuracy } from '@modules/analytics/entities/estimation-accuracy/estimation-accuracy.js';
import {
  type EstimatedIssue,
  type EstimationAccuracyProps,
} from '@modules/analytics/entities/estimation-accuracy/estimation-accuracy.schema.js';
import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';

const defaultProps: EstimationAccuracyProps = {
  cycleId: 'cycle-1',
  teamId: 'team-1',
  issues: [
    {
      externalId: 'issue-1',
      title: 'Default Issue',
      points: 3,
      cycleTimeInDays: 2,
      assigneeName: 'Alice',
      labelNames: ['default'],
    },
  ],
  excludedWithoutEstimation: 0,
  excludedWithoutCycleTime: 0,
};

export class EstimationAccuracyBuilder extends EntityBuilder<
  EstimationAccuracyProps,
  EstimationAccuracy
> {
  constructor() {
    super(defaultProps);
  }

  withCycleId(cycleId: string): this {
    this.props.cycleId = cycleId;
    return this;
  }

  withTeamId(teamId: string): this {
    this.props.teamId = teamId;
    return this;
  }

  withIssues(issues: EstimatedIssue[]): this {
    this.props.issues = issues;
    return this;
  }

  withExcludedWithoutEstimation(count: number): this {
    this.props.excludedWithoutEstimation = count;
    return this;
  }

  withExcludedWithoutCycleTime(count: number): this {
    this.props.excludedWithoutCycleTime = count;
    return this;
  }

  build(): EstimationAccuracy {
    return EstimationAccuracy.create({ ...this.props });
  }
}
