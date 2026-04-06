import { Injectable } from '@nestjs/common';
import { BottleneckAnalysis } from '../../entities/bottleneck-analysis/bottleneck-analysis.js';
import { BottleneckAnalysisDataGateway } from '../../entities/bottleneck-analysis/bottleneck-analysis-data.gateway.js';
import { calculateBusinessHours } from '../../entities/drifting-issue/business-hours.js';
import {
  getMaxBusinessHours,
  requiresSplitting,
} from '../../entities/drifting-issue/drift-grid.js';
import { DriftingIssueDetectionDataGateway } from '../../entities/drifting-issue/drifting-issue-detection-data.gateway.js';
import { type EstimatedIssue } from '../../entities/estimation-accuracy/estimation-accuracy.schema.js';
import { EstimationAccuracyDataGateway } from '../../entities/estimation-accuracy/estimation-accuracy-data.gateway.js';
import { type MemberHealthCycleSnapshot } from '../../entities/member-health/member-health.schema.js';
import { MemberHealthDataGateway } from '../../entities/member-health/member-health-data.gateway.js';
import { TeamSettingsGateway } from '../../entities/team-settings/team-settings.gateway.js';

const DEFAULT_REVIEW_STATUS_SUBSTRING = 'review';
const WELL_ESTIMATED_LOWER_BOUND = 0.5;
const WELL_ESTIMATED_UPPER_BOUND = 2.0;

@Injectable()
export class MemberHealthDataInPrismaGateway extends MemberHealthDataGateway {
  constructor(
    private readonly estimationAccuracyDataGateway: EstimationAccuracyDataGateway,
    private readonly bottleneckAnalysisDataGateway: BottleneckAnalysisDataGateway,
    private readonly teamSettingsGateway: TeamSettingsGateway,
    private readonly driftingIssueDetectionDataGateway: DriftingIssueDetectionDataGateway,
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
    const timezone = await this.teamSettingsGateway.getTimezone(teamId);

    const snapshots: MemberHealthCycleSnapshot[] = [];

    for (const cycleId of lastCycleIds) {
      const memberIssues = await this.fetchMemberIssuesForCycle(
        cycleId,
        teamId,
        memberName,
      );

      const estimationScorePercent =
        this.computeEstimationScorePercent(memberIssues);
      const underestimationRatioPercent =
        this.computeUnderestimationRatioPercent(memberIssues);
      const averageCycleTimeInDays =
        this.computeAverageCycleTimeInDays(memberIssues);

      const medianReviewTimeInHours = await this.computeMedianReviewTimeInHours(
        cycleId,
        teamId,
        memberName,
        configuredReviewStatusName,
      );

      const driftingTicketCount = await this.computeDriftingTicketCount(
        cycleId,
        teamId,
        memberName,
        timezone,
      );

      snapshots.push({
        cycleId,
        estimationScorePercent,
        underestimationRatioPercent,
        averageCycleTimeInDays,
        driftingTicketCount,
        medianReviewTimeInHours,
      });
    }

    return snapshots;
  }

  private async computeDriftingTicketCount(
    cycleId: string,
    teamId: string,
    memberName: string,
    timezone: string,
  ): Promise<number | null> {
    const driftData =
      await this.driftingIssueDetectionDataGateway.getCompletedCycleDriftData(
        teamId,
        cycleId,
      );
    const memberIssues = driftData.filter(
      (issue) => issue.assigneeName === memberName,
    );

    if (memberIssues.length === 0) return null;

    let driftCount = 0;

    for (const issue of memberIssues) {
      if (
        issue.points === null ||
        issue.startedAt === null ||
        issue.completedAt === null
      )
        continue;
      if (requiresSplitting(issue.points)) continue;
      const maxHours = getMaxBusinessHours(issue.points);
      if (maxHours === null) continue;
      const elapsed = calculateBusinessHours(
        issue.startedAt,
        issue.completedAt,
        timezone,
      );
      if (elapsed > maxHours) driftCount++;
    }

    return driftCount;
  }

  private async fetchMemberIssuesForCycle(
    cycleId: string,
    teamId: string,
    memberName: string,
  ): Promise<EstimatedIssue[]> {
    const data = await this.estimationAccuracyDataGateway.getEstimationData(
      cycleId,
      teamId,
    );
    return data.issues.filter((issue) => issue.assigneeName === memberName);
  }

  private computeEstimationScorePercent(
    memberIssues: EstimatedIssue[],
  ): number | null {
    if (memberIssues.length === 0) return null;

    const wellEstimatedCount = memberIssues.filter((issue) => {
      const ratio = issue.points / issue.cycleTimeInDays;
      return (
        ratio >= WELL_ESTIMATED_LOWER_BOUND &&
        ratio <= WELL_ESTIMATED_UPPER_BOUND
      );
    }).length;

    return Math.round((wellEstimatedCount / memberIssues.length) * 100);
  }

  private computeUnderestimationRatioPercent(
    memberIssues: EstimatedIssue[],
  ): number | null {
    if (memberIssues.length === 0) return null;

    const underEstimatedCount = memberIssues.filter((issue) => {
      const ratio = issue.points / issue.cycleTimeInDays;
      return ratio < WELL_ESTIMATED_LOWER_BOUND;
    }).length;

    return Math.round((underEstimatedCount / memberIssues.length) * 100);
  }

  private computeAverageCycleTimeInDays(
    memberIssues: EstimatedIssue[],
  ): number | null {
    if (memberIssues.length === 0) return null;

    const total = memberIssues.reduce(
      (sum, issue) => sum + issue.cycleTimeInDays,
      0,
    );
    return Math.round((total / memberIssues.length) * 10) / 10;
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
