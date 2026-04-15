import { describe, expect, it } from 'vitest';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import { SyncReferenceDataUsecase } from '@/modules/synchronization/usecases/sync-reference-data.usecase.ts';

describe('SyncReferenceDataUsecase', () => {
  it('delegates to the gateway', async () => {
    const gateway = new StubSyncGateway();
    const usecase = new SyncReferenceDataUsecase(gateway);

    await usecase.execute();

    expect(gateway.referenceDataSyncCount).toBe(1);
  });
});
