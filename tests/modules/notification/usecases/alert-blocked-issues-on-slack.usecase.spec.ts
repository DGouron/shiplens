import { describe, it, expect, beforeEach } from 'vitest';
import { AlertBlockedIssuesOnSlackUsecase } from '@modules/notification/usecases/alert-blocked-issues-on-slack.usecase.js';
import { StubTeamAlertChannelGateway } from '@modules/notification/testing/good-path/stub.team-alert-channel.gateway.js';
import { StubSlackMessengerGateway } from '@modules/notification/testing/good-path/stub.slack-messenger.gateway.js';
import { StubBlockedIssueAlertDataGateway } from '@modules/notification/testing/good-path/stub.blocked-issue-alert-data.gateway.js';
import { StubSlackAlertLogGateway } from '@modules/notification/testing/good-path/stub.slack-alert-log.gateway.js';
import { FailingSlackMessengerGateway } from '@modules/notification/testing/bad-path/failing.slack-messenger.gateway.js';
import { TeamAlertChannelBuilder } from '../../../builders/team-alert-channel.builder.js';
import { SlackAlertDeliveryFailedError } from '@modules/notification/entities/team-alert-channel/team-alert-channel.errors.js';
import { type BlockedIssueForAlert } from '@modules/notification/entities/team-alert-channel/blocked-issue-alert-data.gateway.js';

function createBlockedIssue(
  overrides: Partial<BlockedIssueForAlert> = {},
): BlockedIssueForAlert {
  return {
    issueExternalId: 'issue-1',
    issueTitle: 'Fix login bug',
    issueUuid: 'uuid-1',
    statusName: 'In Review',
    severity: 'warning',
    durationHours: 50,
    assigneeName: 'Alice',
    teamId: 'team-1',
    ...overrides,
  };
}

describe('AlertBlockedIssuesOnSlackUsecase', () => {
  let channelGateway: StubTeamAlertChannelGateway;
  let messengerGateway: StubSlackMessengerGateway;
  let alertDataGateway: StubBlockedIssueAlertDataGateway;
  let alertLogGateway: StubSlackAlertLogGateway;
  let usecase: AlertBlockedIssuesOnSlackUsecase;

  beforeEach(() => {
    channelGateway = new StubTeamAlertChannelGateway();
    messengerGateway = new StubSlackMessengerGateway();
    alertDataGateway = new StubBlockedIssueAlertDataGateway();
    alertLogGateway = new StubSlackAlertLogGateway();
    usecase = new AlertBlockedIssuesOnSlackUsecase(
      channelGateway,
      messengerGateway,
      alertDataGateway,
      alertLogGateway,
    );
  });

  it('sends alert for blocked issue with title, status, duration, assignee and link', async () => {
    const channel = new TeamAlertChannelBuilder()
      .withTeamId('team-1')
      .build();
    await channelGateway.save(channel);
    alertDataGateway.issues = [
      createBlockedIssue({
        issueTitle: 'Fix login bug',
        statusName: 'In Review',
        durationHours: 50,
        assigneeName: 'Alice',
        issueUuid: 'uuid-1',
      }),
    ];

    await usecase.execute();

    expect(messengerGateway.sentAlerts).toHaveLength(1);
    const alert = messengerGateway.sentAlerts[0];
    expect(alert.issueTitle).toBe('Fix login bug');
    expect(alert.statusName).toBe('In Review');
    expect(alert.durationHours).toBe(50);
    expect(alert.assigneeName).toBe('Alice');
    expect(alert.issueUrl).toBe('https://linear.app/issue/uuid-1');
    expect(alert.webhookUrl).toBe(channel.webhookUrl);
  });

  it('does not send alert when already alerted today (throttling)', async () => {
    const channel = new TeamAlertChannelBuilder()
      .withTeamId('team-1')
      .build();
    await channelGateway.save(channel);
    alertDataGateway.issues = [createBlockedIssue()];

    await alertLogGateway.recordAlertSent(
      'issue-1',
      new Date().toISOString(),
    );

    await usecase.execute();

    expect(messengerGateway.sentAlerts).toHaveLength(0);
  });

  it('sends alert on new day after previous throttling', async () => {
    const channel = new TeamAlertChannelBuilder()
      .withTeamId('team-1')
      .build();
    await channelGateway.save(channel);
    alertDataGateway.issues = [createBlockedIssue()];

    await alertLogGateway.recordAlertSent('issue-1', '2026-03-30T10:00:00Z');

    await usecase.execute();

    expect(messengerGateway.sentAlerts).toHaveLength(1);
  });

  it('sends alert without assignee mention when no assignee', async () => {
    const channel = new TeamAlertChannelBuilder()
      .withTeamId('team-1')
      .build();
    await channelGateway.save(channel);
    alertDataGateway.issues = [
      createBlockedIssue({ assigneeName: null }),
    ];

    await usecase.execute();

    expect(messengerGateway.sentAlerts).toHaveLength(1);
    expect(messengerGateway.sentAlerts[0].assigneeName).toBeNull();
  });

  it('does not send alert when no channel is configured for the team', async () => {
    alertDataGateway.issues = [createBlockedIssue()];

    await usecase.execute();

    expect(messengerGateway.sentAlerts).toHaveLength(0);
  });

  it('rejects when Slack is unreachable', async () => {
    const channel = new TeamAlertChannelBuilder()
      .withTeamId('team-1')
      .build();
    await channelGateway.save(channel);
    alertDataGateway.issues = [createBlockedIssue()];

    const failingMessenger = new FailingSlackMessengerGateway();
    const usecaseWithFailing = new AlertBlockedIssuesOnSlackUsecase(
      channelGateway,
      failingMessenger,
      alertDataGateway,
      alertLogGateway,
    );

    await expect(usecaseWithFailing.execute()).rejects.toThrow(
      SlackAlertDeliveryFailedError,
    );
  });

  it('sends alerts to correct channels for multiple teams', async () => {
    const channel1 = new TeamAlertChannelBuilder()
      .withTeamId('team-1')
      .withWebhookUrl('https://hooks.slack.com/services/T00/B00/team1')
      .build();
    const channel2 = new TeamAlertChannelBuilder()
      .withTeamId('team-2')
      .withWebhookUrl('https://hooks.slack.com/services/T00/B00/team2')
      .build();
    await channelGateway.save(channel1);
    await channelGateway.save(channel2);

    alertDataGateway.issues = [
      createBlockedIssue({ issueExternalId: 'issue-1', teamId: 'team-1' }),
      createBlockedIssue({ issueExternalId: 'issue-2', teamId: 'team-2' }),
    ];

    await usecase.execute();

    expect(messengerGateway.sentAlerts).toHaveLength(2);
    expect(messengerGateway.sentAlerts[0].webhookUrl).toBe(
      'https://hooks.slack.com/services/T00/B00/team1',
    );
    expect(messengerGateway.sentAlerts[1].webhookUrl).toBe(
      'https://hooks.slack.com/services/T00/B00/team2',
    );
  });

  it('records alert sent after successful delivery', async () => {
    const channel = new TeamAlertChannelBuilder()
      .withTeamId('team-1')
      .build();
    await channelGateway.save(channel);
    alertDataGateway.issues = [createBlockedIssue()];

    await usecase.execute();

    const wasSent = await alertLogGateway.wasAlertSentToday(
      'issue-1',
      new Date().toISOString().slice(0, 10),
    );
    expect(wasSent).toBe(true);
  });
});
