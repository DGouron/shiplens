import { NoCompletedCyclesError } from '@modules/analytics/entities/member-health/member-health.errors.js';
import { MemberHealthPresenter } from '@modules/analytics/interface-adapters/presenters/member-health.presenter.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubMemberHealthDataGateway } from '@modules/analytics/testing/good-path/stub.member-health-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { GetMemberHealthUsecase } from '@modules/analytics/usecases/get-member-health.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('View Member Health Trends (acceptance)', () => {
  let gateway: StubMemberHealthDataGateway;
  let getMemberHealth: GetMemberHealthUsecase;
  let presenter: MemberHealthPresenter;

  beforeEach(() => {
    gateway = new StubMemberHealthDataGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      new StubWorkflowConfigGateway(),
      new StubAvailableStatusesGateway(),
    );
    getMemberHealth = new GetMemberHealthUsecase(
      gateway,
      resolveWorkflowConfig,
    );
    presenter = new MemberHealthPresenter();
  });

  describe("a member's health dashboard displays 5 signals computed over the last N completed cycles", () => {
    it('nominal health: Alice 60% -> 65% -> 70% -> 75% -> estimation signal green + rising + "75%"', async () => {
      gateway.cycleSnapshots = [
        {
          cycleId: 'cycle-1',
          estimationScorePercent: 60,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-2',
          estimationScorePercent: 65,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-3',
          estimationScorePercent: 70,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-4',
          estimationScorePercent: 75,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ];

      const health = await getMemberHealth.execute({
        teamId: 'team-1',
        memberName: 'Alice',
        cycles: 5,
      });
      const dto = presenter.present(health);

      expect(dto.estimationScore.value).toBe('75%');
      expect(dto.estimationScore.trend).toBe('rising');
      expect(dto.estimationScore.indicator).toBe('green');
    });

    it('insufficient history: new member with 1 completed cycle -> 5 signals displayed with "Not enough history"', async () => {
      gateway.cycleSnapshots = [
        {
          cycleId: 'cycle-1',
          estimationScorePercent: 60,
          underestimationRatioPercent: 30,
          averageCycleTimeInDays: 1.5,
          driftingTicketCount: 2,
          medianReviewTimeInHours: 8,
        },
      ];

      const health = await getMemberHealth.execute({
        teamId: 'team-1',
        memberName: 'NewMember',
        cycles: 5,
      });
      const dto = presenter.present(health);

      expect(dto.estimationScore.value).toBe('60%');
      expect(dto.estimationScore.trend).toBeNull();
      expect(dto.estimationScore.indicator).toBe('not-enough-history');
      expect(dto.underestimationRatio.indicator).toBe('not-enough-history');
      expect(dto.averageCycleTime.indicator).toBe('not-enough-history');
      expect(dto.driftingTickets.indicator).toBe('not-enough-history');
      expect(dto.medianReviewTime.indicator).toBe('not-enough-history');
    });

    it('no completed cycles: member without history -> dashboard displays "No data available for this member"', async () => {
      gateway.cycleSnapshots = [];

      await expect(
        getMemberHealth.execute({
          teamId: 'team-1',
          memberName: 'Ghost',
          cycles: 5,
        }),
      ).rejects.toThrow(NoCompletedCyclesError);
    });

    it('member without estimated issues: Charlie 3 cycles, no issues with points -> estimation signal "Not applicable"', async () => {
      gateway.cycleSnapshots = [
        {
          cycleId: 'cycle-1',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-2',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-3',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ];

      const health = await getMemberHealth.execute({
        teamId: 'team-1',
        memberName: 'Charlie',
        cycles: 5,
      });
      const dto = presenter.present(health);

      expect(dto.estimationScore.value).toBe('Not applicable');
      expect(dto.estimationScore.indicator).toBe('not-applicable');
      expect(dto.underestimationRatio.value).toBe('Not applicable');
      expect(dto.underestimationRatio.indicator).toBe('not-applicable');
    });

    it('chronic underestimation: Bob 3 cycles 40% -> 45% -> 50% -> underestimation signal red + rising + "50%"', async () => {
      gateway.cycleSnapshots = [
        {
          cycleId: 'cycle-1',
          estimationScorePercent: null,
          underestimationRatioPercent: 40,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-2',
          estimationScorePercent: null,
          underestimationRatioPercent: 45,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-3',
          estimationScorePercent: null,
          underestimationRatioPercent: 50,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ];

      const health = await getMemberHealth.execute({
        teamId: 'team-1',
        memberName: 'Bob',
        cycles: 5,
      });
      const dto = presenter.present(health);

      expect(dto.underestimationRatio.value).toBe('50%');
      expect(dto.underestimationRatio.trend).toBe('rising');
      expect(dto.underestimationRatio.indicator).toBe('red');
    });

    it('drifting cycle time: Alice 3 cycles 1.2d -> 1.5d -> 2.1d -> cycle time signal red + rising + "2.1d"', async () => {
      gateway.cycleSnapshots = [
        {
          cycleId: 'cycle-1',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: 1.2,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-2',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: 1.5,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-3',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: 2.1,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ];

      const health = await getMemberHealth.execute({
        teamId: 'team-1',
        memberName: 'Alice',
        cycles: 5,
      });
      const dto = presenter.present(health);

      expect(dto.averageCycleTime.value).toBe('2.1d');
      expect(dto.averageCycleTime.trend).toBe('rising');
      expect(dto.averageCycleTime.indicator).toBe('red');
    });

    it('lingering review: Charlie 3 cycles 8h -> 12h -> 24h -> review signal red + rising + "24h"', async () => {
      gateway.cycleSnapshots = [
        {
          cycleId: 'cycle-1',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: 8,
        },
        {
          cycleId: 'cycle-2',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: 12,
        },
        {
          cycleId: 'cycle-3',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: 24,
        },
      ];

      const health = await getMemberHealth.execute({
        teamId: 'team-1',
        memberName: 'Charlie',
        cycles: 5,
      });
      const dto = presenter.present(health);

      expect(dto.medianReviewTime.value).toBe('24h');
      expect(dto.medianReviewTime.trend).toBe('rising');
      expect(dto.medianReviewTime.indicator).toBe('red');
    });

    it('drift improvement: Alice 3 cycles 4 -> 2 -> 1 -> drift signal green + falling + value "1"', async () => {
      gateway.cycleSnapshots = [
        {
          cycleId: 'cycle-1',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: 4,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-2',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: 2,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-3',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: 1,
          medianReviewTimeInHours: null,
        },
      ];

      const health = await getMemberHealth.execute({
        teamId: 'team-1',
        memberName: 'Alice',
        cycles: 5,
      });
      const dto = presenter.present(health);

      expect(dto.driftingTickets.value).toBe('1');
      expect(dto.driftingTickets.trend).toBe('falling');
      expect(dto.driftingTickets.indicator).toBe('green');
    });

    it('mixed trend: Bob 4 cycles 1.5d -> 2d -> 1.2d -> 1.8d -> cycle time signal orange (first deviation)', async () => {
      gateway.cycleSnapshots = [
        {
          cycleId: 'cycle-1',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: 1.5,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-2',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: 2,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-3',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: 1.2,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-4',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: 1.8,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ];

      const health = await getMemberHealth.execute({
        teamId: 'team-1',
        memberName: 'Bob',
        cycles: 5,
      });
      const dto = presenter.present(health);

      expect(dto.averageCycleTime.value).toBe('1.8d');
      expect(dto.averageCycleTime.indicator).toBe('orange');
    });
  });
});
