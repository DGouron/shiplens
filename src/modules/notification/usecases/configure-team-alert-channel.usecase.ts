import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { TeamAlertChannelGateway } from '../entities/team-alert-channel/team-alert-channel.gateway.js';
import { SlackMessengerGateway } from '../entities/slack-notification-config/slack-messenger.gateway.js';
import { TeamAlertChannel } from '../entities/team-alert-channel/team-alert-channel.js';
import { teamAlertChannelGuard } from '../entities/team-alert-channel/team-alert-channel.guard.js';
import { InvalidSlackWebhookUrlError } from '../entities/slack-notification-config/slack-notification-config.errors.js';

interface ConfigureTeamAlertChannelParams {
  teamId: string;
  webhookUrl: string;
}

@Injectable()
export class ConfigureTeamAlertChannelUsecase
  implements Usecase<ConfigureTeamAlertChannelParams, void>
{
  constructor(
    private readonly channelGateway: TeamAlertChannelGateway,
    private readonly messengerGateway: SlackMessengerGateway,
  ) {}

  async execute(params: ConfigureTeamAlertChannelParams): Promise<void> {
    const validationResult = teamAlertChannelGuard.isValid({
      id: randomUUID(),
      teamId: params.teamId,
      webhookUrl: params.webhookUrl,
    });

    if (!validationResult) {
      throw new InvalidSlackWebhookUrlError();
    }

    const existing = await this.channelGateway.findByTeamId(params.teamId);

    const channel = TeamAlertChannel.create({
      id: existing?.id ?? randomUUID(),
      teamId: params.teamId,
      webhookUrl: params.webhookUrl,
    });

    await this.channelGateway.save(channel);
    await this.messengerGateway.sendTestMessage(params.webhookUrl);
  }
}
