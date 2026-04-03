import { NegativeThresholdError } from '@modules/analytics/entities/status-threshold/status-threshold.errors.js';
import { StubStatusThresholdGateway } from '@modules/analytics/testing/good-path/stub.status-threshold.gateway.js';
import { SetStatusThresholdUsecase } from '@modules/analytics/usecases/set-status-threshold.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('SetStatusThresholdUsecase', () => {
  let usecase: SetStatusThresholdUsecase;
  let gateway: StubStatusThresholdGateway;

  beforeEach(() => {
    gateway = new StubStatusThresholdGateway();
    usecase = new SetStatusThresholdUsecase(gateway);
  });

  it('saves a new threshold for a status', async () => {
    await usecase.execute({ statusName: 'In Progress', thresholdHours: 72 });

    const saved = await gateway.findByStatusName('In Progress');
    expect(saved).not.toBeNull();
    expect(saved?.statusName).toBe('In Progress');
    expect(saved?.thresholdHours).toBe(72);
  });

  it('updates an existing threshold for a status', async () => {
    await usecase.execute({ statusName: 'In Progress', thresholdHours: 72 });
    await usecase.execute({ statusName: 'In Progress', thresholdHours: 96 });

    const saved = await gateway.findByStatusName('In Progress');
    expect(saved?.thresholdHours).toBe(96);
  });

  it('rejects negative threshold', async () => {
    await expect(
      usecase.execute({ statusName: 'In Progress', thresholdHours: -5 }),
    ).rejects.toThrow(NegativeThresholdError);
  });

  it('rejects zero threshold', async () => {
    await expect(
      usecase.execute({ statusName: 'In Progress', thresholdHours: 0 }),
    ).rejects.toThrow(NegativeThresholdError);
  });
});
