import { CycleAssigneeIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-assignee-issues.presenter.js';
import { TopCycleAssigneesPresenter } from '@modules/analytics/interface-adapters/presenters/top-cycle-assignees.presenter.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubTopCycleAssigneesDataGateway } from '@modules/analytics/testing/good-path/stub.top-cycle-assignees-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { GetCycleIssuesForAssigneeUsecase } from '@modules/analytics/usecases/get-cycle-issues-for-assignee.usecase.js';
import { GetTopCycleAssigneesUsecase } from '@modules/analytics/usecases/get-top-cycle-assignees.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Show top cycle assignees (acceptance)', () => {
  let dataGateway: StubTopCycleAssigneesDataGateway;
  let topAssigneesUsecase: GetTopCycleAssigneesUsecase;
  let issuesUsecase: GetCycleIssuesForAssigneeUsecase;
  let topAssigneesPresenter: TopCycleAssigneesPresenter;
  let issuesPresenter: CycleAssigneeIssuesPresenter;

  beforeEach(() => {
    dataGateway = new StubTopCycleAssigneesDataGateway();
    const workflowConfigGateway = new StubWorkflowConfigGateway();
    const availableStatusesGateway = new StubAvailableStatusesGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      workflowConfigGateway,
      availableStatusesGateway,
    );
    topAssigneesUsecase = new GetTopCycleAssigneesUsecase(
      dataGateway,
      resolveWorkflowConfig,
    );
    issuesUsecase = new GetCycleIssuesForAssigneeUsecase(
      dataGateway,
      resolveWorkflowConfig,
    );
    topAssigneesPresenter = new TopCycleAssigneesPresenter();
    issuesPresenter = new CycleAssigneeIssuesPresenter();
  });

  describe('the card ranks assignees who completed work in the active cycle', () => {
    it('rank by count: Alice(5) Bob(3) Charlie(2) → sorted descending', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setAssigneeAggregates('team-1', 'cycle-1', [
        {
          assigneeName: 'Charlie',
          issueCount: 2,
          totalPoints: 3,
          totalCycleTimeInHours: 6,
        },
        {
          assigneeName: 'Alice',
          issueCount: 5,
          totalPoints: 12,
          totalCycleTimeInHours: 20,
        },
        {
          assigneeName: 'Bob',
          issueCount: 3,
          totalPoints: 8,
          totalCycleTimeInHours: 10,
        },
      ]);

      const result = topAssigneesPresenter.present(
        await topAssigneesUsecase.execute({ teamId: 'team-1' }),
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.cycleId).toBe('cycle-1');
      expect(result.assignees.map((row) => row.assigneeName)).toEqual([
        'Alice',
        'Bob',
        'Charlie',
      ]);
      expect(result.assignees[0].issueCount).toBe(5);
    });

    it('fewer than 5 assignees: only available rows returned, no padding', async () => {
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
        {
          assigneeName: 'Bob',
          issueCount: 3,
          totalPoints: 4,
          totalCycleTimeInHours: 6,
        },
      ]);

      const result = topAssigneesPresenter.present(
        await topAssigneesUsecase.execute({ teamId: 'team-1' }),
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.assignees).toHaveLength(2);
    });

    it('top cap is 5: an extra 6th assignee is dropped', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setAssigneeAggregates(
        'team-1',
        'cycle-1',
        Array.from({ length: 6 }, (_, index) => ({
          assigneeName: `Member ${index}`,
          issueCount: 10 - index,
          totalPoints: 0,
          totalCycleTimeInHours: 0,
        })),
      );

      const result = topAssigneesPresenter.present(
        await topAssigneesUsecase.execute({ teamId: 'team-1' }),
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.assignees).toHaveLength(5);
    });

    it('completed uses workflow config: started+completed passed to the gateway', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      const availableStatusesGateway = new StubAvailableStatusesGateway();
      availableStatusesGateway.transitionStatuses.set('team-1', [
        'In Progress',
        'Shipped',
      ]);
      const workflowConfigGateway = new StubWorkflowConfigGateway();
      const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
        workflowConfigGateway,
        availableStatusesGateway,
      );
      const usecase = new GetTopCycleAssigneesUsecase(
        dataGateway,
        resolveWorkflowConfig,
      );

      await usecase.execute({ teamId: 'team-1' });

      expect(dataGateway.lastStartedStatuses).toEqual(['In Progress']);
      expect(dataGateway.lastCompletedStatuses).toEqual(['Shipped']);
    });
  });

  describe('the card handles empty states', () => {
    it('no active cycle: returns status no_active_cycle', async () => {
      const result = topAssigneesPresenter.present(
        await topAssigneesUsecase.execute({ teamId: 'team-1' }),
      );

      expect(result).toEqual({ status: 'no_active_cycle' });
    });

    it('empty active cycle: returns ready with no assignees', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setAssigneeAggregates('team-1', 'cycle-1', []);

      const result = topAssigneesPresenter.present(
        await topAssigneesUsecase.execute({ teamId: 'team-1' }),
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.assignees).toEqual([]);
    });
  });

  describe('clicking a row drills down into the assignee issues', () => {
    it('drill-down returns the completed cycle issues for the selected assignee', async () => {
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
            statusName: 'Shipped',
          },
        ],
      });

      const result = issuesPresenter.present(
        await issuesUsecase.execute({
          teamId: 'team-1',
          assigneeName: 'Alice',
        }),
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.assigneeName).toBe('Alice');
      expect(result.issues).toEqual([
        {
          externalId: 'issue-1',
          title: 'Fix login',
          points: 3,
          totalCycleTimeInHours: 12,
          statusName: 'Shipped',
        },
      ]);
    });

    it('drill-down without active cycle returns status no_active_cycle', async () => {
      const result = issuesPresenter.present(
        await issuesUsecase.execute({
          teamId: 'team-1',
          assigneeName: 'Alice',
        }),
      );

      expect(result).toEqual({ status: 'no_active_cycle' });
    });
  });
});
