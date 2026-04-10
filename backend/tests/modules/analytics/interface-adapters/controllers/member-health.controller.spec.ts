import { NoCompletedCyclesError } from '@modules/analytics/entities/member-health/member-health.errors.js';
import { MemberHealthController } from '@modules/analytics/interface-adapters/controllers/member-health.controller.js';
import { MemberHealthPresenter } from '@modules/analytics/interface-adapters/presenters/member-health.presenter.js';
import { StubMemberHealthDataGateway } from '@modules/analytics/testing/good-path/stub.member-health-data.gateway.js';
import { GetMemberHealthUsecase } from '@modules/analytics/usecases/get-member-health.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('MemberHealthController', () => {
  let gateway: StubMemberHealthDataGateway;
  let controller: MemberHealthController;

  beforeEach(() => {
    gateway = new StubMemberHealthDataGateway();
    const usecase = new GetMemberHealthUsecase(gateway);
    const presenter = new MemberHealthPresenter();
    controller = new MemberHealthController(usecase, presenter);
  });

  it('returns member health DTO for a team member', async () => {
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
        estimationScorePercent: 70,
        underestimationRatioPercent: null,
        averageCycleTimeInDays: null,
        driftingTicketCount: null,
        medianReviewTimeInHours: null,
      },
      {
        cycleId: 'cycle-3',
        estimationScorePercent: 75,
        underestimationRatioPercent: null,
        averageCycleTimeInDays: null,
        driftingTicketCount: null,
        medianReviewTimeInHours: null,
      },
    ];

    const dto = await controller.getMemberHealth('team-1', 'Alice', undefined);

    expect(dto.memberName).toBe('Alice');
    expect(dto.estimationScore.value).toBe('75%');
  });

  it('parses cycles query param when provided', async () => {
    let receivedLimit = 0;
    gateway.getMemberCycleSnapshots = async (_teamId, _memberName, limit) => {
      receivedLimit = limit;
      return [
        {
          cycleId: 'cycle-1',
          estimationScorePercent: 50,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ];
    };

    await controller.getMemberHealth('team-1', 'Alice', '7');

    expect(receivedLimit).toBe(7);
  });

  it('defaults to 5 cycles when query param is not provided', async () => {
    let receivedLimit = 0;
    gateway.getMemberCycleSnapshots = async (_teamId, _memberName, limit) => {
      receivedLimit = limit;
      return [
        {
          cycleId: 'cycle-1',
          estimationScorePercent: 50,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ];
    };

    await controller.getMemberHealth('team-1', 'Alice', undefined);

    expect(receivedLimit).toBe(5);
  });

  it('propagates NoCompletedCyclesError when gateway is empty', async () => {
    gateway.cycleSnapshots = [];

    await expect(
      controller.getMemberHealth('team-1', 'Ghost', undefined),
    ).rejects.toThrow(NoCompletedCyclesError);
  });
});
