import { Injectable } from '@nestjs/common';
import { EstimationAccuracyDataGateway } from '../../entities/estimation-accuracy/estimation-accuracy-data.gateway.js';
import { type MemberHealthCycleSnapshot } from '../../entities/member-health/member-health.schema.js';
import { MemberHealthDataGateway } from '../../entities/member-health/member-health-data.gateway.js';

@Injectable()
export class MemberHealthDataInPrismaGateway extends MemberHealthDataGateway {
  constructor(
    private readonly estimationAccuracyDataGateway: EstimationAccuracyDataGateway,
  ) {
    super();
  }

  async getMemberCycleSnapshots(
    teamId: string,
    memberName: string,
    cycleLimit: number,
  ): Promise<MemberHealthCycleSnapshot[]> {
    const completedCycleIds =
      await this.estimationAccuracyDataGateway.getCompletedCycleIds(teamId);

    const lastCycleIds = completedCycleIds.slice(-cycleLimit);

    const snapshots: MemberHealthCycleSnapshot[] = [];

    for (const cycleId of lastCycleIds) {
      const estimationScorePercent = await this.computeEstimationScorePercent(
        cycleId,
        teamId,
        memberName,
      );

      snapshots.push({
        cycleId,
        estimationScorePercent,
        underestimationRatioPercent: null,
        averageCycleTimeInDays: null,
        driftingTicketCount: null,
        medianReviewTimeInHours: null,
      });
    }

    return snapshots;
  }

  private async computeEstimationScorePercent(
    cycleId: string,
    teamId: string,
    memberName: string,
  ): Promise<number | null> {
    const data = await this.estimationAccuracyDataGateway.getEstimationData(
      cycleId,
      teamId,
    );

    const memberIssues = data.issues.filter(
      (issue) => issue.assigneeName === memberName,
    );

    if (memberIssues.length === 0) return null;

    const wellEstimatedCount = memberIssues.filter((issue) => {
      const ratio = issue.points / issue.cycleTimeInDays;
      return ratio >= 0.5 && ratio <= 2.0;
    }).length;

    return Math.round((wellEstimatedCount / memberIssues.length) * 100);
  }
}
