import { InvalidSlackWebhookUrlError } from '@modules/notification/entities/slack-notification-config/slack-notification-config.errors.js';
import { StubSlackMessengerGateway } from '@modules/notification/testing/good-path/stub.slack-messenger.gateway.js';
import { StubSlackNotificationConfigGateway } from '@modules/notification/testing/good-path/stub.slack-notification-config.gateway.js';
import { ConfigureSlackWebhookUsecase } from '@modules/notification/usecases/configure-slack-webhook.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { SlackNotificationConfigBuilder } from '../../../builders/slack-notification-config.builder.js';

describe('ConfigureSlackWebhookUsecase', () => {
  let configGateway: StubSlackNotificationConfigGateway;
  let messengerGateway: StubSlackMessengerGateway;
  let usecase: ConfigureSlackWebhookUsecase;

  beforeEach(() => {
    configGateway = new StubSlackNotificationConfigGateway();
    messengerGateway = new StubSlackMessengerGateway();
    usecase = new ConfigureSlackWebhookUsecase(configGateway, messengerGateway);
  });

  it('saves a new config with enabled true and sends test message', async () => {
    await usecase.execute({
      teamId: 'team-1',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxxx',
    });

    const savedConfig = await configGateway.findByTeamId('team-1');
    expect(savedConfig).not.toBeNull();
    expect(savedConfig?.webhookUrl).toBe(
      'https://hooks.slack.com/services/T00/B00/xxxx',
    );
    expect(savedConfig?.enabled).toBe(true);
    expect(messengerGateway.testMessagesSent).toHaveLength(1);
    expect(messengerGateway.testMessagesSent[0]).toBe(
      'https://hooks.slack.com/services/T00/B00/xxxx',
    );
  });

  it('replaces existing config when modifying webhook', async () => {
    const existingConfig = new SlackNotificationConfigBuilder()
      .withTeamId('team-1')
      .withWebhookUrl('https://hooks.slack.com/services/T00/B00/old')
      .build();
    await configGateway.save(existingConfig);

    await usecase.execute({
      teamId: 'team-1',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/new',
    });

    const savedConfig = await configGateway.findByTeamId('team-1');
    expect(savedConfig?.webhookUrl).toBe(
      'https://hooks.slack.com/services/T00/B00/new',
    );
    expect(messengerGateway.testMessagesSent).toHaveLength(1);
  });

  it('rejects invalid webhook URL', async () => {
    await expect(
      usecase.execute({
        teamId: 'team-1',
        webhookUrl: 'https://not-slack.com/webhook',
      }),
    ).rejects.toThrow(InvalidSlackWebhookUrlError);
  });
});
