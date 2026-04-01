import { describe, it, expect, beforeEach } from 'vitest';
import { ToggleSlackNotificationUsecase } from '@modules/notification/usecases/toggle-slack-notification.usecase.js';
import { StubSlackNotificationConfigGateway } from '@modules/notification/testing/good-path/stub.slack-notification-config.gateway.js';
import { SlackNotificationConfigBuilder } from '../../../builders/slack-notification-config.builder.js';
import { WebhookNotConfiguredError } from '@modules/notification/entities/slack-notification-config/slack-notification-config.errors.js';

describe('ToggleSlackNotificationUsecase', () => {
  let configGateway: StubSlackNotificationConfigGateway;
  let usecase: ToggleSlackNotificationUsecase;

  beforeEach(() => {
    configGateway = new StubSlackNotificationConfigGateway();
    usecase = new ToggleSlackNotificationUsecase(configGateway);
  });

  it('disables notification for an existing config', async () => {
    const existing = new SlackNotificationConfigBuilder().withEnabled(true).build();
    await configGateway.save(existing);

    const result = await usecase.execute({ teamId: existing.teamId, enabled: false });

    expect(result.enabled).toBe(false);
    expect(result.webhookUrl).toBe(existing.webhookUrl);
  });

  it('enables notification for an existing config', async () => {
    const existing = new SlackNotificationConfigBuilder().withEnabled(false).build();
    await configGateway.save(existing);

    const result = await usecase.execute({ teamId: existing.teamId, enabled: true });

    expect(result.enabled).toBe(true);
  });

  it('rejects when no config exists for the team', async () => {
    await expect(
      usecase.execute({ teamId: 'unknown-team', enabled: false }),
    ).rejects.toBeInstanceOf(WebhookNotConfiguredError);
  });
});
