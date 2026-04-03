import { StubTeamSettingsGateway } from '@modules/analytics/testing/good-path/stub.team-settings.gateway.js';
import { GetTeamExcludedStatusesUsecase } from '@modules/analytics/usecases/get-team-excluded-statuses.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('GetTeamExcludedStatusesUsecase', () => {
  let gateway: StubTeamSettingsGateway;
  let usecase: GetTeamExcludedStatusesUsecase;

  beforeEach(() => {
    gateway = new StubTeamSettingsGateway();
    usecase = new GetTeamExcludedStatusesUsecase(gateway);
  });

  it('returns empty array when no exclusions configured', async () => {
    const result = await usecase.execute('team-1');
    expect(result).toEqual([]);
  });

  it('returns excluded statuses for a team', async () => {
    gateway.excludedStatuses.set('team-1', ['Todo', 'Candidate']);

    const result = await usecase.execute('team-1');

    expect(result).toEqual(['Todo', 'Candidate']);
  });

  it('returns different exclusions per team', async () => {
    gateway.excludedStatuses.set('team-1', ['Todo']);
    gateway.excludedStatuses.set('team-2', ['Backlog', 'Candidate']);

    expect(await usecase.execute('team-1')).toEqual(['Todo']);
    expect(await usecase.execute('team-2')).toEqual(['Backlog', 'Candidate']);
  });
});
