import { InvalidSlackWebhookUrlError } from '@modules/notification/entities/slack-notification-config/slack-notification-config.errors.js';
import { StubSlackMessengerGateway } from '@modules/notification/testing/good-path/stub.slack-messenger.gateway.js';
import { StubTeamAlertChannelGateway } from '@modules/notification/testing/good-path/stub.team-alert-channel.gateway.js';
import { ConfigureTeamAlertChannelUsecase } from '@modules/notification/usecases/configure-team-alert-channel.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { TeamAlertChannelBuilder } from '../../../builders/team-alert-channel.builder.js';

describe('ConfigureTeamAlertChannelUsecase', () => {
  let channelGateway: StubTeamAlertChannelGateway;
  let messengerGateway: StubSlackMessengerGateway;
  let usecase: ConfigureTeamAlertChannelUsecase;

  beforeEach(() => {
    channelGateway = new StubTeamAlertChannelGateway();
    messengerGateway = new StubSlackMessengerGateway();
    usecase = new ConfigureTeamAlertChannelUsecase(
      channelGateway,
      messengerGateway,
    );
  });

  it('saves a new alert channel and sends test message', async () => {
    await usecase.execute({
      teamId: 'team-1',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/alerts',
    });

    const saved = await channelGateway.findByTeamId('team-1');
    expect(saved).not.toBeNull();
    expect(saved?.webhookUrl).toBe(
      'https://hooks.slack.com/services/T00/B00/alerts',
    );
    expect(messengerGateway.testMessagesSent).toHaveLength(1);
  });

  it('replaces existing channel when reconfiguring', async () => {
    const existing = new TeamAlertChannelBuilder()
      .withTeamId('team-1')
      .withWebhookUrl('https://hooks.slack.com/services/T00/B00/old')
      .build();
    await channelGateway.save(existing);

    await usecase.execute({
      teamId: 'team-1',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/new',
    });

    const saved = await channelGateway.findByTeamId('team-1');
    expect(saved?.webhookUrl).toBe(
      'https://hooks.slack.com/services/T00/B00/new',
    );
  });

  it('rejects invalid webhook URL', async () => {
    await expect(
      usecase.execute({
        teamId: 'team-1',
        webhookUrl: 'https://not-slack.com/webhook',
      }),
    ).rejects.toThrow(InvalidSlackWebhookUrlError);
  });
});
