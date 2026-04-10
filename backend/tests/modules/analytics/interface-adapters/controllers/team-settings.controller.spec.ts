import { TeamSettingsController } from '@modules/analytics/interface-adapters/controllers/team-settings.controller.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubBlockedIssueAlertGateway } from '@modules/analytics/testing/good-path/stub.blocked-issue-alert.gateway.js';
import { StubTeamSettingsGateway } from '@modules/analytics/testing/good-path/stub.team-settings.gateway.js';
import { GetTeamExcludedStatusesUsecase } from '@modules/analytics/usecases/get-team-excluded-statuses.usecase.js';
import { SetTeamExcludedStatusesUsecase } from '@modules/analytics/usecases/set-team-excluded-statuses.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('TeamSettingsController', () => {
  let settingsGateway: StubTeamSettingsGateway;
  let availableStatusesGateway: StubAvailableStatusesGateway;
  let controller: TeamSettingsController;

  beforeEach(() => {
    settingsGateway = new StubTeamSettingsGateway();
    availableStatusesGateway = new StubAvailableStatusesGateway();
    const alertGateway = new StubBlockedIssueAlertGateway();
    const getUsecase = new GetTeamExcludedStatusesUsecase(settingsGateway);
    const setUsecase = new SetTeamExcludedStatusesUsecase(
      settingsGateway,
      alertGateway,
    );
    controller = new TeamSettingsController(
      getUsecase,
      setUsecase,
      availableStatusesGateway,
      settingsGateway,
    );
  });

  it('returns empty statuses by default', async () => {
    const result = await controller.getExcluded('team-1');

    expect(result).toEqual({ statuses: [] });
  });

  it('returns configured excluded statuses', async () => {
    settingsGateway.excludedStatuses.set('team-1', ['Todo', 'Candidate']);

    const result = await controller.getExcluded('team-1');

    expect(result).toEqual({ statuses: ['Todo', 'Candidate'] });
  });

  it('persists excluded statuses', async () => {
    await controller.setExcluded('team-1', { statuses: ['Todo'] });

    const result = await controller.getExcluded('team-1');
    expect(result).toEqual({ statuses: ['Todo'] });
  });

  it('returns available statuses for a team', async () => {
    availableStatusesGateway.statuses.set('team-1', [
      'Backlog',
      'In Progress',
      'In Review',
      'Done',
      'Todo',
    ]);

    const result = await controller.getAvailable('team-1');

    expect(result).toEqual({
      statuses: ['Backlog', 'In Progress', 'In Review', 'Done', 'Todo'],
    });
  });
});
