import { type BottleneckAnalysisProps } from '@modules/analytics/entities/bottleneck-analysis/bottleneck-analysis.schema.js';
import {
  type EstimatedIssue,
  type EstimationAccuracyProps,
} from '@modules/analytics/entities/estimation-accuracy/estimation-accuracy.schema.js';
import { MemberHealthDataInPrismaGateway } from '@modules/analytics/interface-adapters/gateways/member-health-data.in-prisma.gateway.js';
import { StubBottleneckAnalysisDataGateway } from '@modules/analytics/testing/good-path/stub.bottleneck-analysis-data.gateway.js';
import { StubDriftingIssueDetectionDataGateway } from '@modules/analytics/testing/good-path/stub.drifting-issue-detection-data.gateway.js';
import { StubEstimationAccuracyDataGateway } from '@modules/analytics/testing/good-path/stub.estimation-accuracy-data.gateway.js';
import { StubTeamSettingsGateway } from '@modules/analytics/testing/good-path/stub.team-settings.gateway.js';
import { beforeEach, describe, expect, it } from 'vitest';

function estimatedIssueForMember(params: {
  assigneeName: string;
  points: number;
  cycleTimeInDays: number;
  externalId?: string;
}): EstimatedIssue {
  return {
    externalId: params.externalId ?? `issue-${params.assigneeName}`,
    title: 'Any title',
    points: params.points,
    cycleTimeInDays: params.cycleTimeInDays,
    assigneeName: params.assigneeName,
    labelNames: [],
  };
}

function estimationDataWithIssues(
  cycleId: string,
  issues: EstimatedIssue[],
): EstimationAccuracyProps {
  return {
    cycleId,
    teamId: 'team-1',
    issues,
    excludedWithoutEstimation: 0,
    excludedWithoutCycleTime: 0,
  };
}

function bottleneckWithSingleReviewIssue(params: {
  reviewStatusName: string;
  reviewHours: number;
  assigneeName: string;
  cycleId: string;
}): BottleneckAnalysisProps {
  const reviewStart = '2026-01-02T00:00:00Z';
  const reviewEnd = new Date(
    new Date(reviewStart).getTime() + params.reviewHours * 60 * 60 * 1000,
  ).toISOString();
  return {
    cycleId: params.cycleId,
    teamId: 'team-1',
    completedIssues: [
      {
        externalId: `issue-${params.cycleId}`,
        assigneeName: params.assigneeName,
        transitions: [
          { toStatusName: 'In Progress', occurredAt: '2026-01-01T00:00:00Z' },
          { toStatusName: params.reviewStatusName, occurredAt: reviewStart },
          { toStatusName: 'Done', occurredAt: reviewEnd },
        ],
      },
    ],
  };
}

describe('MemberHealthDataInPrismaGateway', () => {
  let estimationGateway: StubEstimationAccuracyDataGateway;
  let bottleneckGateway: StubBottleneckAnalysisDataGateway;
  let teamSettingsGateway: StubTeamSettingsGateway;
  let driftingIssueGateway: StubDriftingIssueDetectionDataGateway;
  let gateway: MemberHealthDataInPrismaGateway;

  beforeEach(() => {
    estimationGateway = new StubEstimationAccuracyDataGateway();
    bottleneckGateway = new StubBottleneckAnalysisDataGateway();
    teamSettingsGateway = new StubTeamSettingsGateway();
    driftingIssueGateway = new StubDriftingIssueDetectionDataGateway();
    gateway = new MemberHealthDataInPrismaGateway(
      estimationGateway,
      bottleneckGateway,
      teamSettingsGateway,
      driftingIssueGateway,
    );

    estimationGateway.completedCycleIds = ['cycle-1'];
  });

  describe('medianReviewTimeInHours', () => {
    it('resolves review status via default substring match when no team setting is set', async () => {
      bottleneckGateway.bottleneckData = bottleneckWithSingleReviewIssue({
        reviewStatusName: 'In Review',
        reviewHours: 6,
        assigneeName: 'Alice',
        cycleId: 'cycle-1',
      });

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots).toHaveLength(1);
      expect(snapshots[0].medianReviewTimeInHours).toBe(6);
    });

    it('prefers the team-configured review status name over the default substring match', async () => {
      teamSettingsGateway.reviewStatusNames.set('team-1', 'Code Review');
      bottleneckGateway.bottleneckData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        completedIssues: [
          {
            externalId: 'issue-1',
            assigneeName: 'Alice',
            transitions: [
              {
                toStatusName: 'In Progress',
                occurredAt: '2026-01-01T00:00:00Z',
              },
              { toStatusName: 'In Review', occurredAt: '2026-01-02T00:00:00Z' },
              {
                toStatusName: 'Code Review',
                occurredAt: '2026-01-02T04:00:00Z',
              },
              { toStatusName: 'Done', occurredAt: '2026-01-02T14:00:00Z' },
            ],
          },
        ],
      };

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].medianReviewTimeInHours).toBe(10);
    });

    it('falls back to the default substring match when the configured review status is absent from the breakdown', async () => {
      teamSettingsGateway.reviewStatusNames.set('team-1', 'Peer Review');
      bottleneckGateway.bottleneckData = bottleneckWithSingleReviewIssue({
        reviewStatusName: 'In Review',
        reviewHours: 7,
        assigneeName: 'Alice',
        cycleId: 'cycle-1',
      });

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].medianReviewTimeInHours).toBe(7);
    });

    it('returns null when no review-like status exists in the breakdown', async () => {
      bottleneckGateway.bottleneckData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        completedIssues: [
          {
            externalId: 'issue-1',
            assigneeName: 'Alice',
            transitions: [
              {
                toStatusName: 'In Progress',
                occurredAt: '2026-01-01T00:00:00Z',
              },
              { toStatusName: 'Done', occurredAt: '2026-01-01T05:00:00Z' },
            ],
          },
        ],
      };

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].medianReviewTimeInHours).toBeNull();
    });

    it('returns null when the target member is absent from the cycle breakdown', async () => {
      bottleneckGateway.bottleneckData = bottleneckWithSingleReviewIssue({
        reviewStatusName: 'In Review',
        reviewHours: 9,
        assigneeName: 'Bob',
        cycleId: 'cycle-1',
      });

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].medianReviewTimeInHours).toBeNull();
    });

    it('matches review status case-insensitively via the default substring', async () => {
      bottleneckGateway.bottleneckData = bottleneckWithSingleReviewIssue({
        reviewStatusName: 'REVIEWING',
        reviewHours: 11,
        assigneeName: 'Alice',
        cycleId: 'cycle-1',
      });

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].medianReviewTimeInHours).toBe(11);
    });
  });

  describe('underestimationRatioPercent', () => {
    it('returns 100 when every member issue in the cycle is under-estimated', async () => {
      estimationGateway.estimationData = estimationDataWithIssues('cycle-1', [
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 1,
          cycleTimeInDays: 4,
          externalId: 'issue-1',
        }),
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 2,
          cycleTimeInDays: 8,
          externalId: 'issue-2',
        }),
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 1,
          cycleTimeInDays: 3,
          externalId: 'issue-3',
        }),
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 2,
          cycleTimeInDays: 6,
          externalId: 'issue-4',
        }),
      ]);

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Bob',
        5,
      );

      expect(snapshots[0].underestimationRatioPercent).toBe(100);
    });

    it('returns 50 when half of the member issues are under-estimated and half are well-estimated', async () => {
      estimationGateway.estimationData = estimationDataWithIssues('cycle-1', [
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 1,
          cycleTimeInDays: 4,
          externalId: 'issue-1',
        }),
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 2,
          cycleTimeInDays: 8,
          externalId: 'issue-2',
        }),
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 3,
          cycleTimeInDays: 3,
          externalId: 'issue-3',
        }),
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 2,
          cycleTimeInDays: 2,
          externalId: 'issue-4',
        }),
      ]);

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Bob',
        5,
      );

      expect(snapshots[0].underestimationRatioPercent).toBe(50);
    });

    it('returns 0 when every member issue falls inside the well-estimated band', async () => {
      estimationGateway.estimationData = estimationDataWithIssues('cycle-1', [
        estimatedIssueForMember({
          assigneeName: 'Alice',
          points: 3,
          cycleTimeInDays: 3,
          externalId: 'issue-1',
        }),
        estimatedIssueForMember({
          assigneeName: 'Alice',
          points: 4,
          cycleTimeInDays: 2,
          externalId: 'issue-2',
        }),
        estimatedIssueForMember({
          assigneeName: 'Alice',
          points: 2,
          cycleTimeInDays: 3,
          externalId: 'issue-3',
        }),
      ]);

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].underestimationRatioPercent).toBe(0);
    });

    it('returns null when the member has no issues in the cycle', async () => {
      estimationGateway.estimationData = estimationDataWithIssues('cycle-1', [
        estimatedIssueForMember({
          assigneeName: 'Alice',
          points: 3,
          cycleTimeInDays: 3,
          externalId: 'issue-1',
        }),
      ]);

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Bob',
        5,
      );

      expect(snapshots[0].underestimationRatioPercent).toBeNull();
    });

    it('rounds the ratio to the nearest integer when the division is not exact', async () => {
      estimationGateway.estimationData = estimationDataWithIssues('cycle-1', [
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 1,
          cycleTimeInDays: 4,
          externalId: 'issue-1',
        }),
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 1,
          cycleTimeInDays: 4,
          externalId: 'issue-2',
        }),
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 1,
          cycleTimeInDays: 4,
          externalId: 'issue-3',
        }),
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 3,
          cycleTimeInDays: 3,
          externalId: 'issue-4',
        }),
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 3,
          cycleTimeInDays: 3,
          externalId: 'issue-5',
        }),
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 3,
          cycleTimeInDays: 3,
          externalId: 'issue-6',
        }),
        estimatedIssueForMember({
          assigneeName: 'Bob',
          points: 3,
          cycleTimeInDays: 3,
          externalId: 'issue-7',
        }),
      ]);

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Bob',
        5,
      );

      expect(snapshots[0].underestimationRatioPercent).toBe(43);
    });
  });

  describe('driftingTicketCount', () => {
    it('returns 1 when one of three member issues exceeds the drift grid threshold', async () => {
      driftingIssueGateway.completedCycleDriftData = [
        {
          issueExternalId: 'issue-1',
          assigneeName: 'Alice',
          points: 1,
          startedAt: '2026-04-01T09:00:00Z',
          completedAt: '2026-04-01T11:00:00Z',
        },
        {
          issueExternalId: 'issue-2',
          assigneeName: 'Alice',
          points: 1,
          startedAt: '2026-04-01T09:00:00Z',
          completedAt: '2026-04-01T12:00:00Z',
        },
        {
          issueExternalId: 'issue-3',
          assigneeName: 'Alice',
          points: 1,
          startedAt: '2026-04-01T09:00:00Z',
          completedAt: '2026-04-01T17:00:00Z',
        },
      ];

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].driftingTicketCount).toBe(1);
    });

    it('returns 0 when all member issues complete within the drift grid threshold', async () => {
      driftingIssueGateway.completedCycleDriftData = [
        {
          issueExternalId: 'issue-1',
          assigneeName: 'Alice',
          points: 1,
          startedAt: '2026-04-01T09:00:00Z',
          completedAt: '2026-04-01T12:00:00Z',
        },
        {
          issueExternalId: 'issue-2',
          assigneeName: 'Alice',
          points: 2,
          startedAt: '2026-04-01T09:00:00Z',
          completedAt: '2026-04-01T14:00:00Z',
        },
      ];

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].driftingTicketCount).toBe(0);
    });

    it('returns null when no drift data exists for the target member', async () => {
      driftingIssueGateway.completedCycleDriftData = [
        {
          issueExternalId: 'issue-1',
          assigneeName: 'Bob',
          points: 1,
          startedAt: '2026-04-01T09:00:00Z',
          completedAt: '2026-04-01T17:00:00Z',
        },
      ];

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].driftingTicketCount).toBeNull();
    });

    it('skips issues without points or startedAt or completedAt in the drift count', async () => {
      driftingIssueGateway.completedCycleDriftData = [
        {
          issueExternalId: 'issue-1',
          assigneeName: 'Alice',
          points: null,
          startedAt: '2026-04-01T09:00:00Z',
          completedAt: '2026-04-01T17:00:00Z',
        },
        {
          issueExternalId: 'issue-2',
          assigneeName: 'Alice',
          points: 1,
          startedAt: null,
          completedAt: '2026-04-01T17:00:00Z',
        },
        {
          issueExternalId: 'issue-3',
          assigneeName: 'Alice',
          points: 1,
          startedAt: '2026-04-01T09:00:00Z',
          completedAt: null,
        },
        {
          issueExternalId: 'issue-4',
          assigneeName: 'Alice',
          points: 2,
          startedAt: '2026-04-01T09:00:00Z',
          completedAt: '2026-04-01T14:00:00Z',
        },
      ];

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].driftingTicketCount).toBe(0);
    });

    it('skips issues requiring splitting when points are 8 or more', async () => {
      driftingIssueGateway.completedCycleDriftData = [
        {
          issueExternalId: 'issue-1',
          assigneeName: 'Alice',
          points: 8,
          startedAt: '2026-04-01T09:00:00Z',
          completedAt: '2026-04-07T17:00:00Z',
        },
        {
          issueExternalId: 'issue-2',
          assigneeName: 'Alice',
          points: 13,
          startedAt: '2026-04-01T09:00:00Z',
          completedAt: '2026-04-07T17:00:00Z',
        },
        {
          issueExternalId: 'issue-3',
          assigneeName: 'Alice',
          points: 2,
          startedAt: '2026-04-01T09:00:00Z',
          completedAt: '2026-04-01T14:00:00Z',
        },
      ];

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].driftingTicketCount).toBe(0);
    });
  });

  describe('averageCycleTimeInDays', () => {
    it('returns the single cycle time value when the member has exactly one issue', async () => {
      estimationGateway.estimationData = estimationDataWithIssues('cycle-1', [
        estimatedIssueForMember({
          assigneeName: 'Alice',
          points: 2,
          cycleTimeInDays: 2.5,
          externalId: 'issue-1',
        }),
      ]);

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].averageCycleTimeInDays).toBe(2.5);
    });

    it('returns the arithmetic mean when multiple member issues average to a clean decimal', async () => {
      estimationGateway.estimationData = estimationDataWithIssues('cycle-1', [
        estimatedIssueForMember({
          assigneeName: 'Alice',
          points: 1,
          cycleTimeInDays: 1.0,
          externalId: 'issue-1',
        }),
        estimatedIssueForMember({
          assigneeName: 'Alice',
          points: 2,
          cycleTimeInDays: 2.0,
          externalId: 'issue-2',
        }),
        estimatedIssueForMember({
          assigneeName: 'Alice',
          points: 3,
          cycleTimeInDays: 3.0,
          externalId: 'issue-3',
        }),
      ]);

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].averageCycleTimeInDays).toBe(2.0);
    });

    it('rounds the average to one decimal place when the division is not exact', async () => {
      estimationGateway.estimationData = estimationDataWithIssues('cycle-1', [
        estimatedIssueForMember({
          assigneeName: 'Alice',
          points: 1,
          cycleTimeInDays: 1.1,
          externalId: 'issue-1',
        }),
        estimatedIssueForMember({
          assigneeName: 'Alice',
          points: 1,
          cycleTimeInDays: 1.2,
          externalId: 'issue-2',
        }),
        estimatedIssueForMember({
          assigneeName: 'Alice',
          points: 1,
          cycleTimeInDays: 1.4,
          externalId: 'issue-3',
        }),
      ]);

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Alice',
        5,
      );

      expect(snapshots[0].averageCycleTimeInDays).toBe(1.2);
    });

    it('returns null when the member has no issues in the cycle', async () => {
      estimationGateway.estimationData = estimationDataWithIssues('cycle-1', [
        estimatedIssueForMember({
          assigneeName: 'Alice',
          points: 2,
          cycleTimeInDays: 2.0,
          externalId: 'issue-1',
        }),
      ]);

      const snapshots = await gateway.getMemberCycleSnapshots(
        'team-1',
        'Bob',
        5,
      );

      expect(snapshots[0].averageCycleTimeInDays).toBeNull();
    });
  });
});
