import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigureSlackWebhookUsecase } from '@modules/notification/usecases/configure-slack-webhook.usecase.js';
import { StubSlackNotificationConfigGateway } from '@modules/notification/testing/good-path/stub.slack-notification-config.gateway.js';
import { StubSlackMessengerGateway } from '@modules/notification/testing/good-path/stub.slack-messenger.gateway.js';
import { InvalidWebhookUrlError } from '@modules/notification/entities/slack-notification-config/slack-notification-config.errors.js';

describe('ConfigureSlackWebhookUsecase', () => {
  let configGateway: StubSlackNotificationConfigGateway;
  let messengerGateway: StubSlackMessengerGateway;
  let usecase: ConfigureSlackWebhookUsecase;

  const validWebhookUrl = 'https://hooks.slack.com/services/T00/B00/xxx';

  beforeEach(() => {
    configGateway = new StubSlackNotificationConfigGateway();
    messengerGateway = new StubSlackMessengerGateway();
    usecase = new ConfigureSlackWebhookUsecase(configGateway, messengerGateway);
  });

  it('saves a new config with enabled=true and returns it', async () => {
    const config = await usecase.execute({ teamId: 'team-1', webhookUrl: validWebhookUrl });

    expect(config.teamId).toBe('team-1');
    expect(config.webhookUrl).toBe(validWebhookUrl);
    expect(config.enabled).toBe(true);

    const saved = await configGateway.findByTeamId('team-1');
    expect(saved).not.toBeNull();
  });

  it('sends a test message to the webhook', async () => {
    await usecase.execute({ teamId: 'team-1', webhookUrl: validWebhookUrl });

    expect(messengerGateway.sentMessages).toHaveLength(1);
    expect(messengerGateway.sentMessages[0].webhookUrl).toBe(validWebhookUrl);
  });

  it('rejects an invalid webhook URL with InvalidWebhookUrlError', async () => {
    await expect(
      usecase.execute({ teamId: 'team-1', webhookUrl: 'not-a-url' }),
    ).rejects.toBeInstanceOf(InvalidWebhookUrlError);
  });

  it('replaces existing config when reconfiguring', async () => {
    await usecase.execute({ teamId: 'team-1', webhookUrl: validWebhookUrl });
    const newUrl = 'https://hooks.slack.com/services/T00/B00/yyy';

    const config = await usecase.execute({ teamId: 'team-1', webhookUrl: newUrl });

    expect(config.webhookUrl).toBe(newUrl);
    const saved = await configGateway.findByTeamId('team-1');
    expect(saved?.webhookUrl).toBe(newUrl);
  });
});
