import { describe, expect, it } from 'vitest';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { GetSyncSelectionUsecase } from '@/modules/synchronization/usecases/get-sync-selection.usecase.ts';
import { SyncSelectionResponseBuilder } from '../../../builders/sync-selection-response.builder.ts';

describe('GetSyncSelectionUsecase', () => {
  it('delegates to the gateway and returns the selection', async () => {
    const selection = new SyncSelectionResponseBuilder().build();
    const usecase = new GetSyncSelectionUsecase(
      new StubSyncGateway({ selection }),
    );

    const result = await usecase.execute();

    expect(result).toEqual(selection);
  });

  it('returns null when the gateway returns null', async () => {
    const usecase = new GetSyncSelectionUsecase(
      new StubSyncGateway({ selection: null }),
    );

    const result = await usecase.execute();

    expect(result).toBeNull();
  });
});
