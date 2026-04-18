import { TopCycleAssigneesController } from '@modules/analytics/interface-adapters/controllers/top-cycle-assignees.controller.js';
import { CycleAssigneeIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-assignee-issues.presenter.js';
import { TopCycleAssigneesPresenter } from '@modules/analytics/interface-adapters/presenters/top-cycle-assignees.presenter.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubTopCycleAssigneesDataGateway } from '@modules/analytics/testing/good-path/stub.top-cycle-assignees-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { GetCycleIssuesForAssigneeUsecase } from '@modules/analytics/usecases/get-cycle-issues-for-assignee.usecase.js';
import { GetTopCycleAssigneesUsecase } from '@modules/analytics/usecases/get-top-cycle-assignees.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('TopCycleAssigneesController', () => {
  let dataGateway: StubTopCycleAssigneesDataGateway;
  let controller: TopCycleAssigneesController;

  beforeEach(() => {
    dataGateway = new StubTopCycleAssigneesDataGateway();
    const workflowConfigGateway = new StubWorkflowConfigGateway();
    const availableStatusesGateway = new StubAvailableStatusesGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      workflowConfigGateway,
      availableStatusesGateway,
    );
    const topAssigneesUsecase = new GetTopCycleAssigneesUsecase(
      dataGateway,
      resolveWorkflowConfig,
    );
    const issuesUsecase = new GetCycleIssuesForAssigneeUsecase(
      dataGateway,
      resolveWorkflowConfig,
    );
    const topAssigneesPresenter = new TopCycleAssigneesPresenter();
    const issuesPresenter = new CycleAssigneeIssuesPresenter();
    controller = new TopCycleAssigneesController(
      topAssigneesUsecase,
      issuesUsecase,
      topAssigneesPresenter,
      issuesPresenter,
    );
  });

  describe('GET /analytics/top-cycle-assignees/:teamId', () => {
    it('returns no_active_cycle payload when the team has no active cycle', async () => {
      const result = await controller.getTopAssignees('team-1');

      expect(result).toEqual({ status: 'no_active_cycle' });
    });

    it('returns the ranked top assignees for the active cycle', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setAssigneeAggregates('team-1', 'cycle-1', [
        {
          assigneeName: 'Alice',
          issueCount: 5,
          totalPoints: 8,
          totalCycleTimeInHours: 20,
        },
      ]);

      const result = await controller.getTopAssignees('team-1');

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.cycleId).toBe('cycle-1');
      expect(result.assignees).toHaveLength(1);
      expect(result.assignees[0].assigneeName).toBe('Alice');
    });
  });

  describe('GET /analytics/top-cycle-assignees/:teamId/assignees/:assigneeName/issues', () => {
    it('returns no_active_cycle payload when the team has no active cycle', async () => {
      const result = await controller.getAssigneeIssues('team-1', 'Alice');

      expect(result).toEqual({ status: 'no_active_cycle' });
    });

    it('returns the cycle issues for the selected assignee', async () => {
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

      const result = await controller.getAssigneeIssues('team-1', 'Alice');

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.assigneeName).toBe('Alice');
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].externalId).toBe('issue-1');
    });
  });
});
