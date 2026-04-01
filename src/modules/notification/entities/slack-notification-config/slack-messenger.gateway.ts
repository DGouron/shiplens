export interface SlackBlock {
  type: string;
  text?: { type: string; text: string };
}

export interface SlackMessage {
  text: string;
  blocks: SlackBlock[];
}

export abstract class SlackMessengerGateway {
  abstract send(webhookUrl: string, message: SlackMessage): Promise<void>;
}
