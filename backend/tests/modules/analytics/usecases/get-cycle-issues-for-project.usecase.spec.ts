import { NO_PROJECT_BUCKET_ID } from '@modules/analytics/entities/top-cycle-projects/top-cycle-projects.schema.js';
import { StubTopCycleProjectsDataGateway } from '@modules/analytics/testing/good-path/stub.top-cycle-projects-data.gateway.js';
import { GetCycleIssuesForProjectUsecase } from '@modules/analytics/usecases/get-cycle-issues-for-project.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('GetCycleIssuesForProjectUsecase', () => {
  let dataGateway: StubTopCycleProjectsDataGateway;
  let usecase: GetCycleIssuesForProjectUsecase;

  beforeEach(() => {
    dataGateway = new StubTopCycleProjectsDataGateway();
    usecase = new GetCycleIssuesForProjectUsecase(dataGateway);
  });

  it('returns no_active_cycle status when the team has no active cycle', async () => {
    dataGateway.activeCycleLocatorByTeamId.set('team-1', null);

    const result = await usecase.execute({
      teamId: 'team-1',
      projectId: 'project-a',
    });

    expect(result.status).toBe('no_active_cycle');
  });

  it('returns issues and project name for a real project within the active cycle', async () => {
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

    const result = await usecase.execute({
      teamId: 'team-1',
      projectId: 'project-a',
    });

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') {
      return;
    }
    expect(result.cycleId).toBe('cycle-1');
    expect(result.projectExternalId).toBe('project-a');
    expect(result.projectName).toBe('Project A');
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].externalId).toBe('issue-1');
  });

  it('translates the sentinel projectId to null when fetching issues', async () => {
    dataGateway.activeCycleLocatorByTeamId.set('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setIssuesForProject('team-1', 'cycle-1', null, {
      projectName: null,
      issues: [
        {
          externalId: 'issue-orphan',
          title: 'Orphan issue',
          assigneeName: null,
          points: null,
          statusName: 'Todo',
        },
      ],
    });

    const result = await usecase.execute({
      teamId: 'team-1',
      projectId: NO_PROJECT_BUCKET_ID,
    });

    expect(result.status).toBe('ready');
    if (result.status !== 'ready') {
      return;
    }
    expect(result.projectExternalId).toBeNull();
    expect(result.projectName).toBeNull();
    expect(result.issues[0].externalId).toBe('issue-orphan');
  });
});
