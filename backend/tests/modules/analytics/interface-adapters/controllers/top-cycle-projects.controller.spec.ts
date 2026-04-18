import { TopCycleProjectsController } from '@modules/analytics/interface-adapters/controllers/top-cycle-projects.controller.js';
import { CycleProjectIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-project-issues.presenter.js';
import { TopCycleProjectsPresenter } from '@modules/analytics/interface-adapters/presenters/top-cycle-projects.presenter.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubTopCycleProjectsDataGateway } from '@modules/analytics/testing/good-path/stub.top-cycle-projects-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { GetCycleIssuesForProjectUsecase } from '@modules/analytics/usecases/get-cycle-issues-for-project.usecase.js';
import { GetTopCycleProjectsUsecase } from '@modules/analytics/usecases/get-top-cycle-projects.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('TopCycleProjectsController', () => {
  let dataGateway: StubTopCycleProjectsDataGateway;
  let controller: TopCycleProjectsController;

  beforeEach(() => {
    dataGateway = new StubTopCycleProjectsDataGateway();
    const workflowConfigGateway = new StubWorkflowConfigGateway();
    const availableStatusesGateway = new StubAvailableStatusesGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      workflowConfigGateway,
      availableStatusesGateway,
    );
    const topProjectsUsecase = new GetTopCycleProjectsUsecase(
      dataGateway,
      resolveWorkflowConfig,
    );
    const issuesUsecase = new GetCycleIssuesForProjectUsecase(dataGateway);
    const topProjectsPresenter = new TopCycleProjectsPresenter();
    const issuesPresenter = new CycleProjectIssuesPresenter();
    controller = new TopCycleProjectsController(
      topProjectsUsecase,
      issuesUsecase,
      topProjectsPresenter,
      issuesPresenter,
    );
  });

  describe('GET /analytics/top-cycle-projects/:teamId', () => {
    it('returns no_active_cycle payload when the team has no active cycle', async () => {
      dataGateway.activeCycleLocatorByTeamId.set('team-1', null);

      const result = await controller.getTopProjects('team-1');

      expect(result).toEqual({ status: 'no_active_cycle' });
    });

    it('returns the ranked top projects for the active cycle', async () => {
      dataGateway.activeCycleLocatorByTeamId.set('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.projectAggregatesByTeamId.set('team-1', [
        {
          projectExternalId: 'project-a',
          projectName: 'Project A',
          issueCount: 5,
          totalPoints: 8,
          totalCycleTimeInHours: 20,
        },
      ]);

      const result = await controller.getTopProjects('team-1');

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.cycleId).toBe('cycle-1');
      expect(result.projects).toHaveLength(1);
      expect(result.projects[0].projectId).toBe('project-a');
    });
  });

  describe('GET /analytics/top-cycle-projects/:teamId/projects/:projectId/issues', () => {
    it('returns no_active_cycle payload when the team has no active cycle', async () => {
      dataGateway.activeCycleLocatorByTeamId.set('team-1', null);

      const result = await controller.getProjectIssues('team-1', 'project-a');

      expect(result).toEqual({ status: 'no_active_cycle' });
    });

    it('returns the cycle issues for a named project', async () => {
      dataGateway.activeCycleLocatorByTeamId.set('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setIssuesForProject('team-1', 'cycle-1', 'project-a', {
        projectName: 'Project A',
        issues: [
          {
            externalId: 'issue-1',
            title: 'Fix login',
            assigneeName: 'Alice',
            points: 3,
            statusName: 'In Progress',
          },
        ],
      });

      const result = await controller.getProjectIssues('team-1', 'project-a');

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.projectId).toBe('project-a');
      expect(result.projectName).toBe('Project A');
      expect(result.isNoProjectBucket).toBe(false);
      expect(result.issues).toHaveLength(1);
    });

    it('returns the No project bucket when the sentinel projectId is used', async () => {
      dataGateway.activeCycleLocatorByTeamId.set('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setIssuesForProject('team-1', 'cycle-1', null, {
        projectName: null,
        issues: [
          {
            externalId: 'issue-orphan',
            title: 'Orphan',
            assigneeName: null,
            points: null,
            statusName: 'Todo',
          },
        ],
      });

      const result = await controller.getProjectIssues(
        'team-1',
        '__no_project__',
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.isNoProjectBucket).toBe(true);
      expect(result.projectName).toBe('No project');
    });
  });
});
