import { SlackNotificationConfig } from '@modules/notification/entities/slack-notification-config/slack-notification-config.js';
import { type SlackNotificationConfigProps } from '@modules/notification/entities/slack-notification-config/slack-notification-config.schema.js';
import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';

const defaultProps: SlackNotificationConfigProps = {
  id: 'b0000000-0000-4000-8000-000000000001',
  teamId: 'team-1',
  webhookUrl: 'https://hooks.slack.com/services/T00/B00/xxxx',
  enabled: true,
};

export class SlackNotificationConfigBuilder extends EntityBuilder<
  SlackNotificationConfigProps,
  SlackNotificationConfig
> {
  constructor() {
    super(defaultProps);
  }

  withId(id: string): this {
    this.props.id = id;
    return this;
  }

  withTeamId(teamId: string): this {
    this.props.teamId = teamId;
    return this;
  }

  withWebhookUrl(webhookUrl: string): this {
    this.props.webhookUrl = webhookUrl;
    return this;
  }

  withEnabled(enabled: boolean): this {
    this.props.enabled = enabled;
    return this;
  }

  build(): SlackNotificationConfig {
    return SlackNotificationConfig.create({ ...this.props });
  }
}
