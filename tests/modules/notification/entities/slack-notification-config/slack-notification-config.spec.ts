import { describe, it, expect } from 'vitest';
import { SlackNotificationConfig } from '@modules/notification/entities/slack-notification-config/slack-notification-config.js';

describe('SlackNotificationConfig', () => {
  const validProps = {
    id: 'a0000000-0000-4000-8000-000000000001',
    teamId: 'team-1',
    webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxxx',
    enabled: true,
  };

  it('creates a valid slack notification config', () => {
    const config = SlackNotificationConfig.create(validProps);

    expect(config.id).toBe(validProps.id);
    expect(config.teamId).toBe(validProps.teamId);
    expect(config.webhookUrl).toBe(validProps.webhookUrl);
    expect(config.enabled).toBe(true);
  });

  it('rejects invalid webhook URL', () => {
    expect(() =>
      SlackNotificationConfig.create({
        ...validProps,
        webhookUrl: 'https://not-slack.com/webhook',
      }),
    ).toThrow();
  });

  it('rejects empty teamId', () => {
    expect(() =>
      SlackNotificationConfig.create({
        ...validProps,
        teamId: '',
      }),
    ).toThrow();
  });
});
