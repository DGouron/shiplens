import { TeamAlertChannel } from '@modules/notification/entities/team-alert-channel/team-alert-channel.js';
import { describe, expect, it } from 'vitest';

describe('TeamAlertChannel', () => {
  it('creates a valid alert channel', () => {
    const channel = TeamAlertChannel.create({
      id: 'a0000000-0000-4000-8000-000000000001',
      teamId: 'team-1',
      webhookUrl: 'https://hooks.slack.com/services/T00/B00/alerts',
    });

    expect(channel.id).toBe('a0000000-0000-4000-8000-000000000001');
    expect(channel.teamId).toBe('team-1');
    expect(channel.webhookUrl).toBe(
      'https://hooks.slack.com/services/T00/B00/alerts',
    );
  });

  it('rejects an invalid webhook URL', () => {
    expect(() =>
      TeamAlertChannel.create({
        id: 'a0000000-0000-4000-8000-000000000001',
        teamId: 'team-1',
        webhookUrl: 'https://not-slack.com/webhook',
      }),
    ).toThrow();
  });

  it('rejects an empty team ID', () => {
    expect(() =>
      TeamAlertChannel.create({
        id: 'a0000000-0000-4000-8000-000000000001',
        teamId: '',
        webhookUrl: 'https://hooks.slack.com/services/T00/B00/alerts',
      }),
    ).toThrow();
  });
});
