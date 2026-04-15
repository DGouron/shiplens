import { describe, expect, it } from 'vitest';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { SelectAllSyncTargetsUsecase } from '@/modules/synchronization/usecases/select-all-sync-targets.usecase.ts';
import { SyncAvailableTeamResponseBuilder } from '../../../builders/sync-available-team-response.builder.ts';

describe('SelectAllSyncTargetsUsecase', () => {
  it('selects every team and every project from the available teams', async () => {
    const availableTeams = [
      new SyncAvailableTeamResponseBuilder()
        .withTeamId('team-1')
        .withTeamName('Alpha')
        .withProjects([{ projectId: 'project-1', projectName: 'Project One' }])
        .build(),
      new SyncAvailableTeamResponseBuilder()
        .withTeamId('team-2')
        .withTeamName('Bravo')
        .withProjects([{ projectId: 'project-2', projectName: 'Project Two' }])
        .build(),
    ];
    const gateway = new StubSyncGateway();
    const usecase = new SelectAllSyncTargetsUsecase(gateway);

    await usecase.execute({ availableTeams });

    expect(gateway.saveSelectionCalls).toHaveLength(1);
    expect(gateway.saveSelectionCalls[0]).toEqual({
      selectedTeams: [
        { teamId: 'team-1', teamName: 'Alpha' },
        { teamId: 'team-2', teamName: 'Bravo' },
      ],
      selectedProjects: [
        {
          projectId: 'project-1',
          projectName: 'Project One',
          teamId: 'team-1',
        },
        {
          projectId: 'project-2',
          projectName: 'Project Two',
          teamId: 'team-2',
        },
      ],
    });
  });

  it('deduplicates projects shared across teams by projectId, keeping the first teamId occurrence', async () => {
    const availableTeams = [
      new SyncAvailableTeamResponseBuilder()
        .withTeamId('team-1')
        .withTeamName('Alpha')
        .withProjects([{ projectId: 'project-shared', projectName: 'Shared' }])
        .build(),
      new SyncAvailableTeamResponseBuilder()
        .withTeamId('team-2')
        .withTeamName('Bravo')
        .withProjects([
          { projectId: 'project-shared', projectName: 'Shared' },
          { projectId: 'project-2', projectName: 'Project Two' },
        ])
        .build(),
    ];
    const gateway = new StubSyncGateway();
    const usecase = new SelectAllSyncTargetsUsecase(gateway);

    await usecase.execute({ availableTeams });

    expect(gateway.saveSelectionCalls[0]?.selectedProjects).toEqual([
      {
        projectId: 'project-shared',
        projectName: 'Shared',
        teamId: 'team-1',
      },
      { projectId: 'project-2', projectName: 'Project Two', teamId: 'team-2' },
    ]);
  });
});
