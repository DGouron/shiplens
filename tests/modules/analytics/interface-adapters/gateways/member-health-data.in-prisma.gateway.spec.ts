import { type BottleneckAnalysisProps } from '@modules/analytics/entities/bottleneck-analysis/bottleneck-analysis.schema.js';
import { MemberHealthDataInPrismaGateway } from '@modules/analytics/interface-adapters/gateways/member-health-data.in-prisma.gateway.js';
import { StubBottleneckAnalysisDataGateway } from '@modules/analytics/testing/good-path/stub.bottleneck-analysis-data.gateway.js';
import { StubEstimationAccuracyDataGateway } from '@modules/analytics/testing/good-path/stub.estimation-accuracy-data.gateway.js';
import { StubTeamSettingsGateway } from '@modules/analytics/testing/good-path/stub.team-settings.gateway.js';
import { beforeEach, describe, expect, it } from 'vitest';

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
  let gateway: MemberHealthDataInPrismaGateway;

  beforeEach(() => {
    estimationGateway = new StubEstimationAccuracyDataGateway();
    bottleneckGateway = new StubBottleneckAnalysisDataGateway();
    teamSettingsGateway = new StubTeamSettingsGateway();
    gateway = new MemberHealthDataInPrismaGateway(
      estimationGateway,
      bottleneckGateway,
      teamSettingsGateway,
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
});
