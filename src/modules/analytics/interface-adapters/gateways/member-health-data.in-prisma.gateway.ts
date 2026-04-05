import { Injectable } from '@nestjs/common';
import { BottleneckAnalysis } from '../../entities/bottleneck-analysis/bottleneck-analysis.js';
import { BottleneckAnalysisDataGateway } from '../../entities/bottleneck-analysis/bottleneck-analysis-data.gateway.js';
import { EstimationAccuracyDataGateway } from '../../entities/estimation-accuracy/estimation-accuracy-data.gateway.js';
import { type MemberHealthCycleSnapshot } from '../../entities/member-health/member-health.schema.js';
import { MemberHealthDataGateway } from '../../entities/member-health/member-health-data.gateway.js';
import { TeamSettingsGateway } from '../../entities/team-settings/team-settings.gateway.js';

const DEFAULT_REVIEW_STATUS_SUBSTRING = 'review';

@Injectable()
export class MemberHealthDataInPrismaGateway extends MemberHealthDataGateway {
  constructor(
    private readonly estimationAccuracyDataGateway: EstimationAccuracyDataGateway,
    private readonly bottleneckAnalysisDataGateway: BottleneckAnalysisDataGateway,
    private readonly teamSettingsGateway: TeamSettingsGateway,
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
    const configuredReviewStatusName =
      await this.teamSettingsGateway.getReviewStatusName(teamId);

    const snapshots: MemberHealthCycleSnapshot[] = [];

    for (const cycleId of lastCycleIds) {
      const estimationScorePercent = await this.computeEstimationScorePercent(
        cycleId,
        teamId,
        memberName,
      );

      const medianReviewTimeInHours = await this.computeMedianReviewTimeInHours(
        cycleId,
        teamId,
        memberName,
        configuredReviewStatusName,
      );

      snapshots.push({
        cycleId,
        estimationScorePercent,
        underestimationRatioPercent: null,
        averageCycleTimeInDays: null,
        driftingTicketCount: null,
        medianReviewTimeInHours,
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

  private async computeMedianReviewTimeInHours(
    cycleId: string,
    teamId: string,
    memberName: string,
    configuredReviewStatusName: string | null,
  ): Promise<number | null> {
    const bottleneckData =
      await this.bottleneckAnalysisDataGateway.getBottleneckData(
        cycleId,
        teamId,
      );

    if (bottleneckData.completedIssues.length === 0) return null;

    const analysis = BottleneckAnalysis.create(bottleneckData);
    const memberEntry = analysis.assigneeBreakdown.find(
      (entry) => entry.assigneeName === memberName,
    );

    if (!memberEntry) return null;

    if (configuredReviewStatusName !== null) {
      const exactMatch = memberEntry.statusMedians.find(
        (entry) => entry.statusName === configuredReviewStatusName,
      );
      if (exactMatch) return exactMatch.medianHours;
    }

    const substringMatch = memberEntry.statusMedians.find((entry) =>
      entry.statusName.toLowerCase().includes(DEFAULT_REVIEW_STATUS_SUBSTRING),
    );
    return substringMatch?.medianHours ?? null;
  }
}
