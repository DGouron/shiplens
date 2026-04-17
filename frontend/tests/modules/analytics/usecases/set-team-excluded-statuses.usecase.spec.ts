import { describe, expect, it } from 'vitest';
import { StubTeamSettingsGateway } from '@/modules/analytics/testing/good-path/stub.team-settings.in-memory.gateway.ts';
import { SetTeamExcludedStatusesUsecase } from '@/modules/analytics/usecases/set-team-excluded-statuses.usecase.ts';

describe('SetTeamExcludedStatusesUsecase', () => {
  it('persists excluded statuses for the given team', async () => {
    const gateway = new StubTeamSettingsGateway();
    const usecase = new SetTeamExcludedStatusesUsecase(gateway);

    await usecase.execute({
      teamId: 'team-1',
      statuses: ['Backlog', 'Done'],
    });

    expect(gateway.excludedStatuses.get('team-1')).toEqual(['Backlog', 'Done']);
  });
});
