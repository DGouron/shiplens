import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigureSlackWebhookUsecase } from '@modules/notification/usecases/configure-slack-webhook.usecase.js';
import { ToggleSlackNotificationUsecase } from '@modules/notification/usecases/toggle-slack-notification.usecase.js';
import { SendReportToSlackUsecase } from '@modules/notification/usecases/send-report-to-slack.usecase.js';
import { StubSlackNotificationConfigGateway } from '@modules/notification/testing/good-path/stub.slack-notification-config.gateway.js';
import { StubSlackMessengerGateway } from '@modules/notification/testing/good-path/stub.slack-messenger.gateway.js';
import { StubSlackReportDataGateway } from '@modules/notification/testing/good-path/stub.slack-report-data.gateway.js';
import { FailingSlackMessengerGateway } from '@modules/notification/testing/bad-path/failing.slack-messenger.gateway.js';
import { type SlackReportSummary } from '@modules/notification/entities/slack-notification-config/slack-report-data.gateway.js';

describe('Notify Report on Slack (acceptance)', () => {
  let configGateway: StubSlackNotificationConfigGateway;
  let messengerGateway: StubSlackMessengerGateway;
  let reportDataGateway: StubSlackReportDataGateway;
  let configureWebhook: ConfigureSlackWebhookUsecase;
  let toggleNotification: ToggleSlackNotificationUsecase;
  let sendReport: SendReportToSlackUsecase;

  const validWebhookUrl = 'https://hooks.slack.com/services/T00/B00/xxx';
  const teamId = 'team-1';
  const cycleId = 'cycle-1';

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
    configureWebhook = new ConfigureSlackWebhookUsecase(configGateway, messengerGateway);
    toggleNotification = new ToggleSlackNotificationUsecase(configGateway);
    sendReport = new SendReportToSlackUsecase(configGateway, messengerGateway, reportDataGateway);
  });

  describe('sending report requires webhook, report, and notification enabled', () => {
    it('nominal: sends formatted message to Slack with summary and link', async () => {
      await configureWebhook.execute({ teamId, webhookUrl: validWebhookUrl });
      reportDataGateway.reportSummary = reportSummary;

      await sendReport.execute({ cycleId, teamId });

      expect(messengerGateway.sentMessages.length).toBeGreaterThanOrEqual(2);
      const reportMessage = messengerGateway.sentMessages[messengerGateway.sentMessages.length - 1];
      expect(reportMessage.webhookUrl).toBe(validWebhookUrl);
      expect(reportMessage.message.text).toContain('Sprint 10');
      const blocksText = JSON.stringify(reportMessage.message.blocks);
      expect(blocksText).toContain(reportSummary.executiveSummary);
      expect(blocksText).toContain('/analytics/teams/team-1/reports/report-1');
    });

    it('notification disabled: does not send any message', async () => {
      await configureWebhook.execute({ teamId, webhookUrl: validWebhookUrl });
      await toggleNotification.execute({ teamId, enabled: false });
      reportDataGateway.reportSummary = reportSummary;

      const messageCountBefore = messengerGateway.sentMessages.length;
      await sendReport.execute({ cycleId, teamId });

      expect(messengerGateway.sentMessages.length).toBe(messageCountBefore);
    });

    it('webhook not configured: rejects with error', async () => {
      reportDataGateway.reportSummary = reportSummary;

      await expect(sendReport.execute({ cycleId, teamId })).rejects.toThrow(
        "Aucun webhook Slack n'est configuré pour cette équipe. Veuillez en ajouter un dans les paramètres de notification.",
      );
    });

    it('report not generated: rejects with error', async () => {
      await configureWebhook.execute({ teamId, webhookUrl: validWebhookUrl });
      reportDataGateway.reportSummary = null;

      await expect(sendReport.execute({ cycleId, teamId })).rejects.toThrow(
        "Le rapport de sprint n'a pas encore été généré. Impossible d'envoyer la notification.",
      );
    });

    it('slack delivery failed: rejects with error', async () => {
      await configureWebhook.execute({ teamId, webhookUrl: validWebhookUrl });
      reportDataGateway.reportSummary = reportSummary;
      const failingMessenger = new FailingSlackMessengerGateway();
      const sendWithFailingMessenger = new SendReportToSlackUsecase(configGateway, failingMessenger, reportDataGateway);

      await expect(sendWithFailingMessenger.execute({ cycleId, teamId })).rejects.toThrow(
        "L'envoi vers Slack a échoué. Veuillez vérifier la configuration du webhook ou réessayer plus tard.",
      );
    });
  });

  describe('webhook validation rejects invalid URLs', () => {
    it('invalid webhook URL: rejects with error', async () => {
      await expect(
        configureWebhook.execute({ teamId, webhookUrl: 'not-a-valid-url' }),
      ).rejects.toThrow(
        "L'adresse du webhook Slack est invalide. Veuillez vérifier le format.",
      );
    });
  });

  describe('webhook configuration and modification', () => {
    it('configure webhook: saves config and sends test message', async () => {
      const config = await configureWebhook.execute({ teamId, webhookUrl: validWebhookUrl });

      expect(config.webhookUrl).toBe(validWebhookUrl);
      expect(config.enabled).toBe(true);
      expect(messengerGateway.sentMessages).toHaveLength(1);
      expect(messengerGateway.sentMessages[0].webhookUrl).toBe(validWebhookUrl);
    });

    it('modify webhook: replaces old config and sends test message on new webhook', async () => {
      await configureWebhook.execute({ teamId, webhookUrl: validWebhookUrl });
      const newWebhookUrl = 'https://hooks.slack.com/services/T00/B00/yyy';

      const config = await configureWebhook.execute({ teamId, webhookUrl: newWebhookUrl });

      expect(config.webhookUrl).toBe(newWebhookUrl);
      expect(messengerGateway.sentMessages).toHaveLength(2);
      expect(messengerGateway.sentMessages[1].webhookUrl).toBe(newWebhookUrl);
    });
  });
});
