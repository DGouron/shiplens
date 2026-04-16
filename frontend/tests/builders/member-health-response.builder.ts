import {
  type MemberHealthResponse,
  type MemberHealthSignalResponse,
} from '@/modules/analytics/entities/member-health/member-health.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class MemberHealthResponseBuilder extends EntityBuilder<
  MemberHealthResponse,
  MemberHealthResponse
> {
  constructor() {
    super({
      teamId: 'team-1',
      memberName: 'Alice',
      estimationScore: { value: '75%', trend: 'rising', indicator: 'green' },
      underestimationRatio: {
        value: '10%',
        trend: 'falling',
        indicator: 'green',
      },
      averageCycleTime: { value: '2.0d', trend: 'stable', indicator: 'green' },
      driftingTickets: { value: '2', trend: 'falling', indicator: 'green' },
      medianReviewTime: { value: '3h', trend: 'stable', indicator: 'green' },
    });
  }

  withTeamId(teamId: string): this {
    this.props.teamId = teamId;
    return this;
  }

  withMemberName(memberName: string): this {
    this.props.memberName = memberName;
    return this;
  }

  withEstimationScore(signal: MemberHealthSignalResponse): this {
    this.props.estimationScore = { ...signal };
    return this;
  }

  withUnderestimationRatio(signal: MemberHealthSignalResponse): this {
    this.props.underestimationRatio = { ...signal };
    return this;
  }

  withAverageCycleTime(signal: MemberHealthSignalResponse): this {
    this.props.averageCycleTime = { ...signal };
    return this;
  }

  withDriftingTickets(signal: MemberHealthSignalResponse): this {
    this.props.driftingTickets = { ...signal };
    return this;
  }

  withMedianReviewTime(signal: MemberHealthSignalResponse): this {
    this.props.medianReviewTime = { ...signal };
    return this;
  }

  build(): MemberHealthResponse {
    return {
      teamId: this.props.teamId,
      memberName: this.props.memberName,
      estimationScore: { ...this.props.estimationScore },
      underestimationRatio: { ...this.props.underestimationRatio },
      averageCycleTime: { ...this.props.averageCycleTime },
      driftingTickets: { ...this.props.driftingTickets },
      medianReviewTime: { ...this.props.medianReviewTime },
    };
  }
}
