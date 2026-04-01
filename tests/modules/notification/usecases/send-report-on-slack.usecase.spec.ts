import { describe, it, expect, beforeEach } from 'vitest';
import { SendReportOnSlackUsecase } from '@modules/notification/usecases/send-report-on-slack.usecase.js';
import { StubSlackNotificationConfigGateway } from '@modules/notification/testing/good-path/stub.slack-notification-config.gateway.js';
import { StubSlackMessengerGateway } from '@modules/notification/testing/good-path/stub.slack-messenger.gateway.js';
import { FailingSlackMessengerGateway } from '@modules/notification/testing/bad-path/failing.slack-messenger.gateway.js';
import { StubSprintReportGateway } from '@modules/analytics/testing/good-path/stub.sprint-report.gateway.js';
import { SprintReportBuilder } from '../../../builders/sprint-report.builder.js';
import { SlackNotificationConfigBuilder } from '../../../builders/slack-notification-config.builder.js';
import { SlackWebhookNotConfiguredError } from '@modules/notification/entities/slack-notification-config/slack-notification-config.errors.js';
import { ReportNotGeneratedError } from '@modules/notification/entities/slack-notification-config/slack-notification-config.errors.js';
import { SlackDeliveryFailedError } from '@modules/notification/entities/slack-notification-config/slack-notification-config.errors.js';

describe('SendReportOnSlackUsecase', () => {
  let configGateway: StubSlackNotificationConfigGateway;
  let messengerGateway: StubSlackMessengerGateway;
  let reportGateway: StubSprintReportGateway;
  let usecase: SendReportOnSlackUsecase;

  beforeEach(() => {
    configGateway = new StubSlackNotificationConfigGateway();
    messengerGateway = new StubSlackMessengerGateway();
    reportGateway = new StubSprintReportGateway();
    usecase = new SendReportOnSlackUsecase(
      configGateway,
      messengerGateway,
      reportGateway,
    );
  });

  it('sends report to Slack with formatted summary and link', async () => {
    const report = new SprintReportBuilder()
      .withTeamId('team-1')
      .withCycleName('Sprint 10')
      .build();
    await reportGateway.save(report);

    const config = new SlackNotificationConfigBuilder()
      .withTeamId('team-1')
      .withEnabled(true)
      .build();
    await configGateway.save(config);

    await usecase.execute({
      teamId: 'team-1',
      reportId: report.id,
      reportLink: 'https://shiplens.app/reports/123',
    });

    expect(messengerGateway.sentMessages).toHaveLength(1);
    expect(messengerGateway.sentMessages[0].cycleName).toBe('Sprint 10');
    expect(messengerGateway.sentMessages[0].reportLink).toBe(
      'https://shiplens.app/reports/123',
    );
    expect(messengerGateway.sentMessages[0].webhookUrl).toBe(config.webhookUrl);
  });

  it('does not send when notification is disabled', async () => {
    const report = new SprintReportBuilder()
      .withTeamId('team-1')
      .build();
    await reportGateway.save(report);

    const config = new SlackNotificationConfigBuilder()
      .withTeamId('team-1')
      .withEnabled(false)
      .build();
    await configGateway.save(config);

    await usecase.execute({
      teamId: 'team-1',
      reportId: report.id,
      reportLink: 'https://shiplens.app/reports/123',
    });

    expect(messengerGateway.sentMessages).toHaveLength(0);
  });

  it('rejects when webhook is not configured', async () => {
    const report = new SprintReportBuilder()
      .withTeamId('team-1')
      .build();
    await reportGateway.save(report);

    await expect(
      usecase.execute({
        teamId: 'team-1',
        reportId: report.id,
        reportLink: 'https://shiplens.app/reports/123',
      }),
    ).rejects.toThrow(SlackWebhookNotConfiguredError);
  });

  it('rejects when report has not been generated', async () => {
    const config = new SlackNotificationConfigBuilder()
      .withTeamId('team-1')
      .withEnabled(true)
      .build();
    await configGateway.save(config);

    await expect(
      usecase.execute({
        teamId: 'team-1',
        reportId: 'nonexistent-report',
        reportLink: 'https://shiplens.app/reports/123',
      }),
    ).rejects.toThrow(ReportNotGeneratedError);
  });

  it('rejects when Slack delivery fails', async () => {
    const report = new SprintReportBuilder()
      .withTeamId('team-1')
      .build();
    await reportGateway.save(report);

    const config = new SlackNotificationConfigBuilder()
      .withTeamId('team-1')
      .withEnabled(true)
      .build();
    await configGateway.save(config);

    const failingMessenger = new FailingSlackMessengerGateway();
    const usecaseWithFailingMessenger = new SendReportOnSlackUsecase(
      configGateway,
      failingMessenger,
      reportGateway,
    );

    await expect(
      usecaseWithFailingMessenger.execute({
        teamId: 'team-1',
        reportId: report.id,
        reportLink: 'https://shiplens.app/reports/123',
      }),
    ).rejects.toThrow(SlackDeliveryFailedError);
  });
});
