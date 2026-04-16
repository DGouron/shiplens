import { describe, expect, it } from 'vitest';
import { StubTeamSettingsGateway } from '@/modules/analytics/testing/good-path/stub.team-settings.in-memory.gateway.ts';
import { GetTeamStatusSettingsUsecase } from '@/modules/analytics/usecases/get-team-status-settings.usecase.ts';

describe('GetTeamStatusSettingsUsecase', () => {
  it('returns available and excluded statuses in parallel', async () => {
    const gateway = new StubTeamSettingsGateway();
    gateway.availableStatuses.set('team-1', [
      'Backlog',
      'Todo',
      'In Progress',
      'Done',
    ]);
    gateway.excludedStatuses.set('team-1', ['Backlog']);
    const usecase = new GetTeamStatusSettingsUsecase(gateway);

    const result = await usecase.execute('team-1');

    expect(result.availableStatuses).toEqual([
      'Backlog',
      'Todo',
      'In Progress',
      'Done',
    ]);
    expect(result.excludedStatuses).toEqual(['Backlog']);
  });

  it('returns empty arrays when no statuses configured', async () => {
    const gateway = new StubTeamSettingsGateway();
    const usecase = new GetTeamStatusSettingsUsecase(gateway);

    const result = await usecase.execute('team-1');

    expect(result.availableStatuses).toEqual([]);
    expect(result.excludedStatuses).toEqual([]);
  });
});
