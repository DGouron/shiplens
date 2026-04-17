import { describe, expect, it } from 'vitest';
import { StubTeamSettingsGateway } from '@/modules/analytics/testing/good-path/stub.team-settings.in-memory.gateway.ts';
import { GetTeamTimezoneUsecase } from '@/modules/analytics/usecases/get-team-timezone.usecase.ts';

describe('GetTeamTimezoneUsecase', () => {
  it('returns the timezone for the given team', async () => {
    const gateway = new StubTeamSettingsGateway();
    gateway.timezones.set('team-1', 'America/New_York');
    const usecase = new GetTeamTimezoneUsecase(gateway);

    const result = await usecase.execute('team-1');

    expect(result).toEqual({ timezone: 'America/New_York' });
  });
});
