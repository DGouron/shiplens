import { describe, expect, it } from 'vitest';
import { StubDriftGridGateway } from '@/modules/analytics/testing/good-path/stub.drift-grid.in-memory.gateway.ts';
import { GetDriftGridEntriesUsecase } from '@/modules/analytics/usecases/get-drift-grid-entries.usecase.ts';

describe('GetDriftGridEntriesUsecase', () => {
  it('returns drift grid entries from gateway', async () => {
    const gateway = new StubDriftGridGateway();
    const usecase = new GetDriftGridEntriesUsecase(gateway);

    const result = await usecase.execute();

    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ points: 1, maxBusinessHours: 4 });
    expect(result[3]).toEqual({ points: 5, maxBusinessHours: 20 });
  });
});
