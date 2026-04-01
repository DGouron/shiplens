import { describe, it, expect } from 'vitest';
import { SlackNotificationConfigPresenter } from '@modules/notification/interface-adapters/presenters/slack-notification-config.presenter.js';
import { SlackNotificationConfigBuilder } from '../../../../builders/slack-notification-config.builder.js';

describe('SlackNotificationConfigPresenter', () => {
  const presenter = new SlackNotificationConfigPresenter();

  it('presents config as DTO', () => {
    const config = new SlackNotificationConfigBuilder()
      .withTeamId('team-42')
      .withWebhookUrl('https://hooks.slack.com/services/T00/B00/xxx')
      .withEnabled(true)
      .build();

    const dto = presenter.present(config);

    expect(dto).toEqual({
      teamId: 'team-42',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxx',
      enabled: true,
    });
  });
});
