import { describe, expect, it } from 'vitest';
import { StubTeamSelectionStorageGateway } from '@/modules/analytics/testing/good-path/stub.team-selection-storage.in-memory.gateway.ts';
import { GetPersistedTeamSelectionUsecase } from '@/modules/analytics/usecases/get-persisted-team-selection.usecase.ts';

describe('GetPersistedTeamSelectionUsecase', () => {
  it('returns null when no selection is persisted for the workspace', async () => {
    const storage = new StubTeamSelectionStorageGateway();
    const usecase = new GetPersistedTeamSelectionUsecase(storage);

    const result = await usecase.execute({ workspaceId: 'workspace-1' });

    expect(result).toBeNull();
  });

  it('returns the persisted team id when one exists for the workspace', async () => {
    const storage = new StubTeamSelectionStorageGateway();
    storage.write('workspace-1', 'team-alpha');
    const usecase = new GetPersistedTeamSelectionUsecase(storage);

    const result = await usecase.execute({ workspaceId: 'workspace-1' });

    expect(result).toBe('team-alpha');
  });
});
