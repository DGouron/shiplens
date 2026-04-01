import { type SlackNotificationConfigProps } from './slack-notification-config.schema.js';
import { slackNotificationConfigGuard } from './slack-notification-config.guard.js';

export class SlackNotificationConfig {
  private constructor(private readonly props: SlackNotificationConfigProps) {}

  static create(props: unknown): SlackNotificationConfig {
    const validatedProps = slackNotificationConfigGuard.parse(props);
    return new SlackNotificationConfig(validatedProps);
  }

  get id(): string {
    return this.props.id;
  }

  get teamId(): string {
    return this.props.teamId;
  }

  get webhookUrl(): string {
    return this.props.webhookUrl;
  }

  get enabled(): boolean {
    return this.props.enabled;
  }
}
