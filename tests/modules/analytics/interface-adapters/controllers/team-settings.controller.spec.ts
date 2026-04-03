import { describe, it, expect, beforeEach } from 'vitest';
import { TeamSettingsController } from '@modules/analytics/interface-adapters/controllers/team-settings.controller.js';
import { GetTeamExcludedStatusesUsecase } from '@modules/analytics/usecases/get-team-excluded-statuses.usecase.js';
import { SetTeamExcludedStatusesUsecase } from '@modules/analytics/usecases/set-team-excluded-statuses.usecase.js';
import { StubTeamSettingsGateway } from '@modules/analytics/testing/good-path/stub.team-settings.gateway.js';

describe('TeamSettingsController', () => {
  let gateway: StubTeamSettingsGateway;
  let controller: TeamSettingsController;

  beforeEach(() => {
    gateway = new StubTeamSettingsGateway();
    const getUsecase = new GetTeamExcludedStatusesUsecase(gateway);
    const setUsecase = new SetTeamExcludedStatusesUsecase(gateway);
    controller = new TeamSettingsController(getUsecase, setUsecase);
  });

  it('returns empty statuses by default', async () => {
    const result = await controller.getExcluded('team-1');

    expect(result).toEqual({ statuses: [] });
  });

  it('returns configured excluded statuses', async () => {
    gateway.excludedStatuses.set('team-1', ['Todo', 'Candidate']);

    const result = await controller.getExcluded('team-1');

    expect(result).toEqual({ statuses: ['Todo', 'Candidate'] });
  });

  it('persists excluded statuses', async () => {
    await controller.setExcluded('team-1', { statuses: ['Todo'] });

    const result = await controller.getExcluded('team-1');
    expect(result).toEqual({ statuses: ['Todo'] });
  });
});
