import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';
import { TeamAlertChannel } from '@modules/notification/entities/team-alert-channel/team-alert-channel.js';
import { type TeamAlertChannelProps } from '@modules/notification/entities/team-alert-channel/team-alert-channel.schema.js';

const defaultProps: TeamAlertChannelProps = {
  id: 'a0000000-0000-4000-8000-000000000001',
  teamId: 'team-1',
  webhookUrl: 'https://hooks.slack.com/services/T00/B00/alerts',
};

export class TeamAlertChannelBuilder extends EntityBuilder<
  TeamAlertChannelProps,
  TeamAlertChannel
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

  build(): TeamAlertChannel {
    return TeamAlertChannel.create({ ...this.props });
  }
}
