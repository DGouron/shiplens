import { describe, it, expect } from 'vitest';
import { SlackNotificationConfigPresenter } from '@modules/notification/interface-adapters/presenters/slack-notification-config.presenter.js';
import { SlackNotificationConfigBuilder } from '../../../../builders/slack-notification-config.builder.js';

describe('SlackNotificationConfigPresenter', () => {
  const presenter = new SlackNotificationConfigPresenter();

  it('presents a slack notification config as a DTO', () => {
    const config = new SlackNotificationConfigBuilder()
      .withTeamId('team-1')
      .withWebhookUrl('https://hooks.slack.com/services/T00/B00/xxxx')
      .withEnabled(true)
      .build();

    const dto = presenter.present(config);

    expect(dto).toEqual({
      teamId: 'team-1',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxxx',
      enabled: true,
    });
  });

  it('presents a disabled config', () => {
    const config = new SlackNotificationConfigBuilder()
      .withEnabled(false)
      .build();

    const dto = presenter.present(config);

    expect(dto.enabled).toBe(false);
  });
});
