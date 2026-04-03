import { StubBlockedIssueAlertGateway } from '@modules/analytics/testing/good-path/stub.blocked-issue-alert.gateway.js';
import { StubTeamSettingsGateway } from '@modules/analytics/testing/good-path/stub.team-settings.gateway.js';
import { SetTeamExcludedStatusesUsecase } from '@modules/analytics/usecases/set-team-excluded-statuses.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { BlockedIssueAlertBuilder } from '../../../builders/blocked-issue-alert.builder.js';

describe('SetTeamExcludedStatusesUsecase', () => {
  let settingsGateway: StubTeamSettingsGateway;
  let alertGateway: StubBlockedIssueAlertGateway;
  let usecase: SetTeamExcludedStatusesUsecase;

  beforeEach(() => {
    settingsGateway = new StubTeamSettingsGateway();
    alertGateway = new StubBlockedIssueAlertGateway();
    usecase = new SetTeamExcludedStatusesUsecase(settingsGateway, alertGateway);
  });

  it('persists excluded statuses for a team', async () => {
    await usecase.execute({
      teamId: 'team-1',
      statuses: ['Todo', 'Candidate'],
    });

    const stored = await settingsGateway.getExcludedStatuses('team-1');
    expect(stored).toEqual(['Todo', 'Candidate']);
  });

  it('replaces previous exclusions', async () => {
    settingsGateway.excludedStatuses.set('team-1', ['Todo']);

    await usecase.execute({ teamId: 'team-1', statuses: ['Backlog'] });

    const stored = await settingsGateway.getExcludedStatuses('team-1');
    expect(stored).toEqual(['Backlog']);
  });

  it('resolves active alerts on newly excluded statuses', async () => {
    const todoAlert = new BlockedIssueAlertBuilder()
      .withStatusName('Todo')
      .withActive(true)
      .build();
    const inProgressAlert = new BlockedIssueAlertBuilder()
      .withIssueExternalId('issue-2')
      .withStatusName('In Progress')
      .withActive(true)
      .build();
    alertGateway.alerts = [todoAlert, inProgressAlert];

    await usecase.execute({ teamId: 'team-1', statuses: ['Todo'] });

    const activeAlerts = alertGateway.alerts.filter((a) => a.active);
    expect(activeAlerts).toHaveLength(1);
    expect(activeAlerts[0].statusName).toBe('In Progress');
  });
});
