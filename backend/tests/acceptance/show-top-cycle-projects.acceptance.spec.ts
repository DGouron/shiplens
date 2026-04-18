import { CycleProjectIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-project-issues.presenter.js';
import { TopCycleProjectsPresenter } from '@modules/analytics/interface-adapters/presenters/top-cycle-projects.presenter.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubTopCycleProjectsDataGateway } from '@modules/analytics/testing/good-path/stub.top-cycle-projects-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { GetCycleIssuesForProjectUsecase } from '@modules/analytics/usecases/get-cycle-issues-for-project.usecase.js';
import { GetTopCycleProjectsUsecase } from '@modules/analytics/usecases/get-top-cycle-projects.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Show top cycle projects (acceptance)', () => {
  let dataGateway: StubTopCycleProjectsDataGateway;
  let topProjectsUsecase: GetTopCycleProjectsUsecase;
  let issuesUsecase: GetCycleIssuesForProjectUsecase;
  let topProjectsPresenter: TopCycleProjectsPresenter;
  let issuesPresenter: CycleProjectIssuesPresenter;

  beforeEach(() => {
    dataGateway = new StubTopCycleProjectsDataGateway();
    const workflowConfigGateway = new StubWorkflowConfigGateway();
    const availableStatusesGateway = new StubAvailableStatusesGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      workflowConfigGateway,
      availableStatusesGateway,
    );
    topProjectsUsecase = new GetTopCycleProjectsUsecase(
      dataGateway,
      resolveWorkflowConfig,
    );
    issuesUsecase = new GetCycleIssuesForProjectUsecase(dataGateway);
    topProjectsPresenter = new TopCycleProjectsPresenter();
    issuesPresenter = new CycleProjectIssuesPresenter();
  });

  describe('the card ranks projects touched in the active cycle', () => {
    it('nominal ranking by count: A(5) B(3) C(2) D(1) E(1) → top 5 sorted descending', async () => {
      dataGateway.activeCycleLocatorByTeamId.set('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.projectAggregatesByTeamId.set('team-1', [
        {
          projectExternalId: 'project-c',
          projectName: 'C',
          issueCount: 2,
          totalPoints: 3,
          totalCycleTimeInHours: 6,
        },
        {
          projectExternalId: 'project-a',
          projectName: 'A',
          issueCount: 5,
          totalPoints: 12,
          totalCycleTimeInHours: 20,
        },
        {
          projectExternalId: 'project-e',
          projectName: 'E',
          issueCount: 1,
          totalPoints: 2,
          totalCycleTimeInHours: 3,
        },
        {
          projectExternalId: 'project-b',
          projectName: 'B',
          issueCount: 3,
          totalPoints: 8,
          totalCycleTimeInHours: 10,
        },
        {
          projectExternalId: 'project-d',
          projectName: 'D',
          issueCount: 1,
          totalPoints: 1,
          totalCycleTimeInHours: 2,
        },
      ]);

      const result = topProjectsPresenter.present(
        await topProjectsUsecase.execute({ teamId: 'team-1' }),
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.cycleId).toBe('cycle-1');
      expect(result.projects.map((row) => row.projectId)).toEqual([
        'project-a',
        'project-b',
        'project-c',
        'project-d',
        'project-e',
      ]);
      expect(result.projects[0].issueCount).toBe(5);
    });

    it('fewer than 5 projects: only available rows are returned, no padding', async () => {
      dataGateway.activeCycleLocatorByTeamId.set('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.projectAggregatesByTeamId.set('team-1', [
        {
          projectExternalId: 'project-a',
          projectName: 'A',
          issueCount: 5,
          totalPoints: 8,
          totalCycleTimeInHours: 20,
        },
        {
          projectExternalId: 'project-b',
          projectName: 'B',
          issueCount: 3,
          totalPoints: 4,
          totalCycleTimeInHours: 6,
        },
      ]);

      const result = topProjectsPresenter.present(
        await topProjectsUsecase.execute({ teamId: 'team-1' }),
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.projects).toHaveLength(2);
    });

    it('No project bucket participates in ranking like any other project', async () => {
      dataGateway.activeCycleLocatorByTeamId.set('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.projectAggregatesByTeamId.set('team-1', [
        {
          projectExternalId: 'project-a',
          projectName: 'A',
          issueCount: 7,
          totalPoints: 12,
          totalCycleTimeInHours: 30,
        },
        {
          projectExternalId: null,
          projectName: null,
          issueCount: 3,
          totalPoints: 5,
          totalCycleTimeInHours: 8,
        },
      ]);

      const result = topProjectsPresenter.present(
        await topProjectsUsecase.execute({ teamId: 'team-1' }),
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.projects).toHaveLength(2);
      expect(result.projects[0].projectId).toBe('project-a');
      expect(result.projects[1].projectId).toBe('__no_project__');
      expect(result.projects[1].projectName).toBe('No project');
      expect(result.projects[1].isNoProjectBucket).toBe(true);
    });

    it('sub-issue without project is counted in No project, not parent\u2019s project', async () => {
      dataGateway.activeCycleLocatorByTeamId.set('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.projectAggregatesByTeamId.set('team-1', [
        {
          projectExternalId: 'project-a',
          projectName: 'A',
          issueCount: 1,
          totalPoints: 5,
          totalCycleTimeInHours: 10,
        },
        {
          projectExternalId: null,
          projectName: null,
          issueCount: 1,
          totalPoints: 2,
          totalCycleTimeInHours: null,
        },
      ]);

      const result = topProjectsPresenter.present(
        await topProjectsUsecase.execute({ teamId: 'team-1' }),
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      const projectA = result.projects.find(
        (row) => row.projectId === 'project-a',
      );
      const bucket = result.projects.find(
        (row) => row.projectId === '__no_project__',
      );
      expect(projectA?.issueCount).toBe(1);
      expect(bucket?.issueCount).toBe(1);
    });
  });

  describe('the card handles empty states', () => {
    it('no active cycle: returns status no_active_cycle', async () => {
      dataGateway.activeCycleLocatorByTeamId.set('team-1', null);

      const result = topProjectsPresenter.present(
        await topProjectsUsecase.execute({ teamId: 'team-1' }),
      );

      expect(result).toEqual({ status: 'no_active_cycle' });
    });

    it('empty active cycle: returns ready with no projects', async () => {
      dataGateway.activeCycleLocatorByTeamId.set('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.projectAggregatesByTeamId.set('team-1', []);

      const result = topProjectsPresenter.present(
        await topProjectsUsecase.execute({ teamId: 'team-1' }),
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.projects).toEqual([]);
    });
  });

  describe('clicking a row drills down into the project issues', () => {
    it('drill-down for a real project returns its cycle issues with title, assignee, points, status', async () => {
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

      const result = issuesPresenter.present(
        await issuesUsecase.execute({
          teamId: 'team-1',
          projectId: 'project-a',
        }),
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.projectId).toBe('project-a');
      expect(result.projectName).toBe('Project A');
      expect(result.isNoProjectBucket).toBe(false);
      expect(result.issues).toEqual([
        {
          externalId: 'issue-1',
          title: 'Fix login',
          assigneeName: 'Alice',
          points: 3,
          statusName: 'In Progress',
        },
      ]);
    });

    it('drill-down for the No project sentinel returns issues whose project is unset', async () => {
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

      const result = issuesPresenter.present(
        await issuesUsecase.execute({
          teamId: 'team-1',
          projectId: '__no_project__',
        }),
      );

      if (result.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(result.projectId).toBe('__no_project__');
      expect(result.projectName).toBe('No project');
      expect(result.isNoProjectBucket).toBe(true);
      expect(result.issues[0].externalId).toBe('issue-orphan');
    });

    it('drill-down without active cycle returns status no_active_cycle', async () => {
      dataGateway.activeCycleLocatorByTeamId.set('team-1', null);

      const result = issuesPresenter.present(
        await issuesUsecase.execute({
          teamId: 'team-1',
          projectId: 'project-a',
        }),
      );

      expect(result).toEqual({ status: 'no_active_cycle' });
    });
  });
});
