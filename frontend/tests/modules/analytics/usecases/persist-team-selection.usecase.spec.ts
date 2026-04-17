import { describe, expect, it } from 'vitest';
import { StubTeamSelectionStorageGateway } from '@/modules/analytics/testing/good-path/stub.team-selection-storage.in-memory.gateway.ts';
import { PersistTeamSelectionUsecase } from '@/modules/analytics/usecases/persist-team-selection.usecase.ts';

describe('PersistTeamSelectionUsecase', () => {
  it('writes the team id under the given workspace key', async () => {
    const storage = new StubTeamSelectionStorageGateway();
    const usecase = new PersistTeamSelectionUsecase(storage);

    await usecase.execute({
      workspaceId: 'workspace-1',
      teamId: 'team-alpha',
    });

    expect(storage.read('workspace-1')).toBe('team-alpha');
  });

  it('overwrites a previously persisted selection for the same workspace', async () => {
    const storage = new StubTeamSelectionStorageGateway();
    storage.write('workspace-1', 'team-bravo');
    const usecase = new PersistTeamSelectionUsecase(storage);

    await usecase.execute({
      workspaceId: 'workspace-1',
      teamId: 'team-alpha',
    });

    expect(storage.read('workspace-1')).toBe('team-alpha');
  });
});
