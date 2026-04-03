import { describe, it, expect, beforeEach } from 'vitest';
import { SetTeamExcludedStatusesUsecase } from '@modules/analytics/usecases/set-team-excluded-statuses.usecase.js';
import { StubTeamSettingsGateway } from '@modules/analytics/testing/good-path/stub.team-settings.gateway.js';

describe('SetTeamExcludedStatusesUsecase', () => {
  let gateway: StubTeamSettingsGateway;
  let usecase: SetTeamExcludedStatusesUsecase;

  beforeEach(() => {
    gateway = new StubTeamSettingsGateway();
    usecase = new SetTeamExcludedStatusesUsecase(gateway);
  });

  it('persists excluded statuses for a team', async () => {
    await usecase.execute({ teamId: 'team-1', statuses: ['Todo', 'Candidate'] });

    const stored = await gateway.getExcludedStatuses('team-1');
    expect(stored).toEqual(['Todo', 'Candidate']);
  });

  it('replaces previous exclusions', async () => {
    gateway.excludedStatuses.set('team-1', ['Todo']);

    await usecase.execute({ teamId: 'team-1', statuses: ['Backlog'] });

    const stored = await gateway.getExcludedStatuses('team-1');
    expect(stored).toEqual(['Backlog']);
  });
});
