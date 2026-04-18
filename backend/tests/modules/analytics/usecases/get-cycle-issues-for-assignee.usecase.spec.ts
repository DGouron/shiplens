import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubTopCycleAssigneesDataGateway } from '@modules/analytics/testing/good-path/stub.top-cycle-assignees-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { GetCycleIssuesForAssigneeUsecase } from '@modules/analytics/usecases/get-cycle-issues-for-assignee.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('GetCycleIssuesForAssigneeUsecase', () => {
  let dataGateway: StubTopCycleAssigneesDataGateway;
  let workflowConfigGateway: StubWorkflowConfigGateway;
  let availableStatusesGateway: StubAvailableStatusesGateway;
  let resolveWorkflowConfig: ResolveWorkflowConfigUsecase;
  let usecase: GetCycleIssuesForAssigneeUsecase;

  beforeEach(() => {
    dataGateway = new StubTopCycleAssigneesDataGateway();
    workflowConfigGateway = new StubWorkflowConfigGateway();
    availableStatusesGateway = new StubAvailableStatusesGateway();
    resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      workflowConfigGateway,
      availableStatusesGateway,
    );
    usecase = new GetCycleIssuesForAssigneeUsecase(
      dataGateway,
      resolveWorkflowConfig,
    );
  });

  it('returns no_active_cycle status when the team has no active cycle', async () => {
    const result = await usecase.execute({
      teamId: 'team-1',
      assigneeName: 'Alice',
    });

    expect(result.status).toBe('no_active_cycle');
  });

  it('returns issues for the target assignee within the active cycle', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setIssuesForAssignee('team-1', 'cycle-1', 'Alice', {
      assigneeName: 'Alice',
      issues: [
        {
          externalId: 'issue-1',
          title: 'Fix login',
          points: 3,
          totalCycleTimeInHours: 12,
          statusName: 'Done',
        },
      ],
    });

    const result = await usecase.execute({
      teamId: 'team-1',
      assigneeName: 'Alice',
    });

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') {
      return;
    }
    expect(result.cycleId).toBe('cycle-1');
    expect(result.cycleName).toBe('Sprint 10');
    expect(result.assigneeName).toBe('Alice');
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].externalId).toBe('issue-1');
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

    await usecase.execute({ teamId: 'team-1', assigneeName: 'Alice' });

    expect(dataGateway.lastStartedStatuses).toEqual(['In Progress']);
    expect(dataGateway.lastCompletedStatuses).toEqual(['Done']);
  });
});
