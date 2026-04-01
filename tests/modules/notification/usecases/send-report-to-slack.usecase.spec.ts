import { describe, it, expect, beforeEach } from 'vitest';
import { SendReportToSlackUsecase } from '@modules/notification/usecases/send-report-to-slack.usecase.js';
import { StubSlackNotificationConfigGateway } from '@modules/notification/testing/good-path/stub.slack-notification-config.gateway.js';
import { StubSlackMessengerGateway } from '@modules/notification/testing/good-path/stub.slack-messenger.gateway.js';
import { StubSlackReportDataGateway } from '@modules/notification/testing/good-path/stub.slack-report-data.gateway.js';
import { FailingSlackMessengerGateway } from '@modules/notification/testing/bad-path/failing.slack-messenger.gateway.js';
import { SlackNotificationConfigBuilder } from '../../../builders/slack-notification-config.builder.js';
import { WebhookNotConfiguredError } from '@modules/notification/entities/slack-notification-config/slack-notification-config.errors.js';
import { ReportNotGeneratedError } from '@modules/notification/entities/slack-notification-config/slack-notification-config.errors.js';
import { SlackDeliveryFailedError } from '@modules/notification/entities/slack-notification-config/slack-notification-config.errors.js';
import { type SlackReportSummary } from '@modules/notification/entities/slack-notification-config/slack-report-data.gateway.js';

describe('SendReportToSlackUsecase', () => {
  let configGateway: StubSlackNotificationConfigGateway;
  let messengerGateway: StubSlackMessengerGateway;
  let reportDataGateway: StubSlackReportDataGateway;
  let usecase: SendReportToSlackUsecase;

  const reportSummary: SlackReportSummary = {
    reportId: 'report-1',
    cycleName: 'Sprint 10',
    teamId: 'team-1',
    executiveSummary: 'Le sprint s\'est bien passé.',
    highlights: 'Migration terminée.',
    risks: 'Deux issues critiques.',
    generatedAt: '2026-01-15T10:00:00.000Z',
  };

  beforeEach(() => {
    configGateway = new StubSlackNotificationConfigGateway();
    messengerGateway = new StubSlackMessengerGateway();
    reportDataGateway = new StubSlackReportDataGateway();
    usecase = new SendReportToSlackUsecase(configGateway, messengerGateway, reportDataGateway);
  });

  it('sends a formatted message to Slack with report summary and link', async () => {
    const config = new SlackNotificationConfigBuilder().build();
    await configGateway.save(config);
    reportDataGateway.reportSummary = reportSummary;

    await usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' });

    expect(messengerGateway.sentMessages).toHaveLength(1);
    const sent = messengerGateway.sentMessages[0];
    expect(sent.webhookUrl).toBe(config.webhookUrl);
    expect(sent.message.text).toContain('Sprint 10');
    const blocksText = JSON.stringify(sent.message.blocks);
    expect(blocksText).toContain(reportSummary.executiveSummary);
    expect(blocksText).toContain('/analytics/teams/team-1/reports/report-1');
  });

  it('does not send when notification is disabled', async () => {
    const config = new SlackNotificationConfigBuilder().withEnabled(false).build();
    await configGateway.save(config);
    reportDataGateway.reportSummary = reportSummary;

    await usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' });

    expect(messengerGateway.sentMessages).toHaveLength(0);
  });

  it('rejects when no webhook is configured', async () => {
    reportDataGateway.reportSummary = reportSummary;

    await expect(
      usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(WebhookNotConfiguredError);
  });

  it('rejects when report has not been generated', async () => {
    const config = new SlackNotificationConfigBuilder().build();
    await configGateway.save(config);
    reportDataGateway.reportSummary = null;

    await expect(
      usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(ReportNotGeneratedError);
  });

  it('rejects when Slack delivery fails', async () => {
    const config = new SlackNotificationConfigBuilder().build();
    await configGateway.save(config);
    reportDataGateway.reportSummary = reportSummary;
    const failingMessenger = new FailingSlackMessengerGateway();
    const usecaseWithFailingMessenger = new SendReportToSlackUsecase(
      configGateway,
      failingMessenger,
      reportDataGateway,
    );

    await expect(
      usecaseWithFailingMessenger.execute({ cycleId: 'cycle-1', teamId: 'team-1' }),
    ).rejects.toBeInstanceOf(SlackDeliveryFailedError);
  });
});
