import { describe, it, expect, beforeEach } from 'vitest';
import { SlackNotificationController } from '@modules/notification/interface-adapters/controllers/slack-notification.controller.js';
import { ConfigureSlackWebhookUsecase } from '@modules/notification/usecases/configure-slack-webhook.usecase.js';
import { ToggleSlackNotificationUsecase } from '@modules/notification/usecases/toggle-slack-notification.usecase.js';
import { SendReportToSlackUsecase } from '@modules/notification/usecases/send-report-to-slack.usecase.js';
import { SlackNotificationConfigPresenter } from '@modules/notification/interface-adapters/presenters/slack-notification-config.presenter.js';
import { StubSlackNotificationConfigGateway } from '@modules/notification/testing/good-path/stub.slack-notification-config.gateway.js';
import { StubSlackMessengerGateway } from '@modules/notification/testing/good-path/stub.slack-messenger.gateway.js';
import { StubSlackReportDataGateway } from '@modules/notification/testing/good-path/stub.slack-report-data.gateway.js';

describe('SlackNotificationController', () => {
  let controller: SlackNotificationController;
  let messengerGateway: StubSlackMessengerGateway;

  beforeEach(() => {
    const configGateway = new StubSlackNotificationConfigGateway();
    messengerGateway = new StubSlackMessengerGateway();
    const reportDataGateway = new StubSlackReportDataGateway();
    const configureWebhook = new ConfigureSlackWebhookUsecase(configGateway, messengerGateway);
    const toggleNotification = new ToggleSlackNotificationUsecase(configGateway);
    const sendReport = new SendReportToSlackUsecase(configGateway, messengerGateway, reportDataGateway);
    const presenter = new SlackNotificationConfigPresenter();
    controller = new SlackNotificationController(
      configureWebhook,
      toggleNotification,
      sendReport,
      presenter,
    );
  });

  it('configure returns a config DTO', async () => {
    const dto = await controller.configure({
      teamId: 'team-1',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
    });

    expect(dto.teamId).toBe('team-1');
    expect(dto.webhookUrl).toBe('https://hooks.slack.com/services/T00/B00/xxx');
    expect(dto.enabled).toBe(true);
  });

  it('toggle returns the updated config DTO', async () => {
    await controller.configure({
      teamId: 'team-1',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
    });

    const dto = await controller.toggle({ teamId: 'team-1', enabled: false });

    expect(dto.enabled).toBe(false);
  });

  it('send delegates to use case and returns void', async () => {
    await controller.configure({
      teamId: 'team-1',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
    });
    const reportDataGateway = new StubSlackReportDataGateway();
    reportDataGateway.reportSummary = {
      reportId: 'r1',
      cycleName: 'Sprint 1',
      teamId: 'team-1',
      executiveSummary: 'Good',
      highlights: 'Done',
      risks: 'None',
      generatedAt: '2026-01-01',
    };

    expect(messengerGateway.sentMessages).toHaveLength(1);
  });
});
