import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubTopCycleAssigneesDataGateway } from '@modules/analytics/testing/good-path/stub.top-cycle-assignees-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { GetTopCycleAssigneesUsecase } from '@modules/analytics/usecases/get-top-cycle-assignees.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('GetTopCycleAssigneesUsecase', () => {
  let dataGateway: StubTopCycleAssigneesDataGateway;
  let workflowConfigGateway: StubWorkflowConfigGateway;
  let availableStatusesGateway: StubAvailableStatusesGateway;
  let resolveWorkflowConfig: ResolveWorkflowConfigUsecase;
  let usecase: GetTopCycleAssigneesUsecase;

  beforeEach(() => {
    dataGateway = new StubTopCycleAssigneesDataGateway();
    workflowConfigGateway = new StubWorkflowConfigGateway();
    availableStatusesGateway = new StubAvailableStatusesGateway();
    resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      workflowConfigGateway,
      availableStatusesGateway,
    );
    usecase = new GetTopCycleAssigneesUsecase(
      dataGateway,
      resolveWorkflowConfig,
    );
  });

  it('returns no_active_cycle status when the team has no active cycle', async () => {
    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.status).toBe('no_active_cycle');
  });

  it('returns aggregates with cycle info when the team has an active cycle', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setAssigneeAggregates('team-1', 'cycle-1', [
      {
        assigneeName: 'Alice',
        issueCount: 3,
        totalPoints: 8,
        totalCycleTimeInHours: 12,
      },
    ]);

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') {
      return;
    }
    expect(result.cycleId).toBe('cycle-1');
    expect(result.cycleName).toBe('Sprint 10');
    expect(result.aggregates).toHaveLength(1);
    expect(result.aggregates[0].assigneeName).toBe('Alice');
  });

  it('passes resolved workflow statuses to the data gateway', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    availableStatusesGateway.transitionStatuses.set('team-1', [
      'In Progress',
      'Done',
    ]);

    await usecase.execute({ teamId: 'team-1' });

    expect(dataGateway.lastStartedStatuses).toEqual(['In Progress']);
    expect(dataGateway.lastCompletedStatuses).toEqual(['Done']);
  });
});
