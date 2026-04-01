import { type TeamAlertChannelProps } from './team-alert-channel.schema.js';
import { teamAlertChannelGuard } from './team-alert-channel.guard.js';

export class TeamAlertChannel {
  private constructor(private readonly props: TeamAlertChannelProps) {}

  static create(props: unknown): TeamAlertChannel {
    const validatedProps = teamAlertChannelGuard.parse(props);
    return new TeamAlertChannel(validatedProps);
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
}
