import { describe, it, expect } from 'vitest';
import { SlackNotificationConfig } from '@modules/notification/entities/slack-notification-config/slack-notification-config.js';

describe('SlackNotificationConfig', () => {
  const validProps = {
    id: 'b0000000-0000-4000-8000-000000000001',
    teamId: 'team-1',
    webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
    enabled: true,
  };

  it('creates a config with valid props', () => {
    const config = SlackNotificationConfig.create(validProps);

    expect(config.id).toBe(validProps.id);
    expect(config.teamId).toBe(validProps.teamId);
    expect(config.webhookUrl).toBe(validProps.webhookUrl);
    expect(config.enabled).toBe(true);
  });

  it('rejects an invalid webhook URL', () => {
    expect(() =>
      SlackNotificationConfig.create({ ...validProps, webhookUrl: 'not-a-url' }),
    ).toThrow();
  });

  it('rejects a webhook URL not starting with https://hooks.slack.com/', () => {
    expect(() =>
      SlackNotificationConfig.create({
        ...validProps,
        webhookUrl: 'https://example.com/webhook',
      }),
    ).toThrow();
  });

  it('rejects an empty teamId', () => {
    expect(() =>
      SlackNotificationConfig.create({ ...validProps, teamId: '' }),
    ).toThrow();
  });

  it('creates a disabled config', () => {
    const config = SlackNotificationConfig.create({ ...validProps, enabled: false });

    expect(config.enabled).toBe(false);
  });
});
