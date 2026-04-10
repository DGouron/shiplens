import { StubSprintReportGateway } from '@modules/analytics/testing/good-path/stub.sprint-report.gateway.js';
import { FailingSlackMessengerGateway } from '@modules/notification/testing/bad-path/failing.slack-messenger.gateway.js';
import { StubSlackMessengerGateway } from '@modules/notification/testing/good-path/stub.slack-messenger.gateway.js';
import { StubSlackNotificationConfigGateway } from '@modules/notification/testing/good-path/stub.slack-notification-config.gateway.js';
import { ConfigureSlackWebhookUsecase } from '@modules/notification/usecases/configure-slack-webhook.usecase.js';
import { SendReportOnSlackUsecase } from '@modules/notification/usecases/send-report-on-slack.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { SlackNotificationConfigBuilder } from '../builders/slack-notification-config.builder.js';
import { SprintReportBuilder } from '../builders/sprint-report.builder.js';

describe('Notify Report on Slack (acceptance)', () => {
  let configGateway: StubSlackNotificationConfigGateway;
  let messengerGateway: StubSlackMessengerGateway;
  let reportGateway: StubSprintReportGateway;
  let sendReportOnSlack: SendReportOnSlackUsecase;
  let configureSlackWebhook: ConfigureSlackWebhookUsecase;

  beforeEach(() => {
    configGateway = new StubSlackNotificationConfigGateway();
    messengerGateway = new StubSlackMessengerGateway();
    reportGateway = new StubSprintReportGateway();
    sendReportOnSlack = new SendReportOnSlackUsecase(
      configGateway,
      messengerGateway,
      reportGateway,
    );
    configureSlackWebhook = new ConfigureSlackWebhookUsecase(
      configGateway,
      messengerGateway,
    );
  });

  describe('sending report requires webhook configured, report generated, notification enabled', () => {
    it('nominal send: report sent to Slack with formatted summary and link', async () => {
      const report = new SprintReportBuilder()
        .withTeamId('team-1')
        .withCycleName('Sprint 10')
        .build();
      await reportGateway.save(report);

      const notificationConfig = new SlackNotificationConfigBuilder()
        .withTeamId('team-1')
        .withEnabled(true)
        .build();
      await configGateway.save(notificationConfig);

      await sendReportOnSlack.execute({
        teamId: 'team-1',
        reportId: report.id,
        reportLink: 'https://shiplens.app/reports/123',
      });

      expect(messengerGateway.sentMessages).toHaveLength(1);
      expect(messengerGateway.sentMessages[0].cycleName).toBe('Sprint 10');
      expect(messengerGateway.sentMessages[0].reportLink).toBe(
        'https://shiplens.app/reports/123',
      );
    });

    it('notification disabled: no message sent', async () => {
      const report = new SprintReportBuilder().withTeamId('team-1').build();
      await reportGateway.save(report);

      const notificationConfig = new SlackNotificationConfigBuilder()
        .withTeamId('team-1')
        .withEnabled(false)
        .build();
      await configGateway.save(notificationConfig);

      await sendReportOnSlack.execute({
        teamId: 'team-1',
        reportId: report.id,
        reportLink: 'https://shiplens.app/reports/123',
      });

      expect(messengerGateway.sentMessages).toHaveLength(0);
    });

    it('webhook not configured: rejects with error message', async () => {
      const report = new SprintReportBuilder().withTeamId('team-1').build();
      await reportGateway.save(report);

      await expect(
        sendReportOnSlack.execute({
          teamId: 'team-1',
          reportId: report.id,
          reportLink: 'https://shiplens.app/reports/123',
        }),
      ).rejects.toThrow(
        "Aucun webhook Slack n'est configuré pour cette équipe. Veuillez en ajouter un dans les paramètres de notification.",
      );
    });

    it('report not generated: rejects with error message', async () => {
      const notificationConfig = new SlackNotificationConfigBuilder()
        .withTeamId('team-1')
        .withEnabled(true)
        .build();
      await configGateway.save(notificationConfig);

      await expect(
        sendReportOnSlack.execute({
          teamId: 'team-1',
          reportId: 'nonexistent-report',
          reportLink: 'https://shiplens.app/reports/123',
        }),
      ).rejects.toThrow(
        "Le rapport de sprint n'a pas encore été généré. Impossible d'envoyer la notification.",
      );
    });

    it('Slack delivery failed: rejects with error message', async () => {
      const report = new SprintReportBuilder().withTeamId('team-1').build();
      await reportGateway.save(report);

      const notificationConfig = new SlackNotificationConfigBuilder()
        .withTeamId('team-1')
        .withEnabled(true)
        .build();
      await configGateway.save(notificationConfig);

      const failingMessenger = new FailingSlackMessengerGateway();
      const sendWithFailingMessenger = new SendReportOnSlackUsecase(
        configGateway,
        failingMessenger,
        reportGateway,
      );

      await expect(
        sendWithFailingMessenger.execute({
          teamId: 'team-1',
          reportId: report.id,
          reportLink: 'https://shiplens.app/reports/123',
        }),
      ).rejects.toThrow(
        "L'envoi vers Slack a échoué. Veuillez vérifier la configuration du webhook ou réessayer plus tard.",
      );
    });
  });

  describe('webhook configuration validates URL and sends test message', () => {
    it('configure webhook: saves config and sends test message', async () => {
      await configureSlackWebhook.execute({
        teamId: 'team-1',
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxxx',
      });

      const savedConfig = await configGateway.findByTeamId('team-1');
      expect(savedConfig).not.toBeNull();
      expect(savedConfig?.enabled).toBe(true);
      expect(messengerGateway.testMessagesSent).toHaveLength(1);
    });

    it('modify webhook: replaces old config and sends test message on new channel', async () => {
      await configureSlackWebhook.execute({
        teamId: 'team-1',
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/old',
      });

      await configureSlackWebhook.execute({
        teamId: 'team-1',
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/new',
      });

      const savedConfig = await configGateway.findByTeamId('team-1');
      expect(savedConfig?.webhookUrl).toBe(
        'https://hooks.slack.com/services/T00/B00/new',
      );
      expect(messengerGateway.testMessagesSent).toHaveLength(2);
    });

    it('invalid webhook URL: rejects with error message', async () => {
      await expect(
        configureSlackWebhook.execute({
          teamId: 'team-1',
          webhookUrl: 'https://not-slack.com/webhook',
        }),
      ).rejects.toThrow(
        "L'adresse du webhook Slack est invalide. Veuillez vérifier le format.",
      );
    });
  });
});
