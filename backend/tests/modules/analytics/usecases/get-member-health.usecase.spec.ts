import { NoCompletedCyclesError } from '@modules/analytics/entities/member-health/member-health.errors.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubMemberHealthDataGateway } from '@modules/analytics/testing/good-path/stub.member-health-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { GetMemberHealthUsecase } from '@modules/analytics/usecases/get-member-health.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('GetMemberHealthUsecase', () => {
  let gateway: StubMemberHealthDataGateway;
  let usecase: GetMemberHealthUsecase;

  beforeEach(() => {
    gateway = new StubMemberHealthDataGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      new StubWorkflowConfigGateway(),
      new StubAvailableStatusesGateway(),
    );
    usecase = new GetMemberHealthUsecase(gateway, resolveWorkflowConfig);
  });

  it('returns a MemberHealth entity with cycle snapshots', async () => {
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

    const health = await usecase.execute({
      teamId: 'team-1',
      memberName: 'Alice',
      cycles: 5,
    });

    expect(health.memberName).toBe('Alice');
    expect(health.teamId).toBe('team-1');
    const signal = health.estimationScoreSignal();
    expect(signal.isApplicable).toBe(true);
  });

  it('throws NoCompletedCyclesError when gateway returns no snapshots', async () => {
    gateway.cycleSnapshots = [];

    await expect(
      usecase.execute({
        teamId: 'team-1',
        memberName: 'Ghost',
        cycles: 5,
      }),
    ).rejects.toThrow(NoCompletedCyclesError);
  });
});
