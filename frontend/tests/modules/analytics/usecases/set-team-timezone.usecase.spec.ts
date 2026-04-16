import { describe, expect, it } from 'vitest';
import { StubTeamSettingsGateway } from '@/modules/analytics/testing/good-path/stub.team-settings.in-memory.gateway.ts';
import { SetTeamTimezoneUsecase } from '@/modules/analytics/usecases/set-team-timezone.usecase.ts';

describe('SetTeamTimezoneUsecase', () => {
  it('persists the timezone for the given team', async () => {
    const gateway = new StubTeamSettingsGateway();
    const usecase = new SetTeamTimezoneUsecase(gateway);

    await usecase.execute({ teamId: 'team-1', timezone: 'Asia/Tokyo' });

    expect(gateway.timezones.get('team-1')).toBe('Asia/Tokyo');
  });
});
