import { createHmac } from 'crypto';

interface WebhookEventBuilderProps {
  deliveryId: string;
  action: string;
  type: string;
  teamId: string;
  data: Record<string, unknown>;
  webhookSecret: string;
}

interface BuiltWebhookEvent {
  deliveryId: string;
  action: string;
  type: string;
  teamId: string;
  data: Record<string, unknown>;
  rawBody: string;
  signature: string;
  webhookSecret: string;
}

const defaultProps: WebhookEventBuilderProps = {
  deliveryId: 'delivery-default',
  action: 'create',
  type: 'Issue',
  teamId: 'team-1',
  data: {
    externalId: 'issue-ext-default',
    teamId: 'team-1',
    title: 'Default issue',
    statusName: 'Todo',
    points: null,
    labelIds: '',
    assigneeName: null,
    createdAt: '2026-03-31T00:00:00Z',
    updatedAt: '2026-03-31T00:00:00Z',
  },
  webhookSecret: 'test-webhook-secret',
};

export class WebhookEventBuilder {
  private props: WebhookEventBuilderProps;

  constructor() {
    this.props = { ...defaultProps, data: { ...defaultProps.data } };
  }

  withDeliveryId(deliveryId: string): this {
    this.props.deliveryId = deliveryId;
    return this;
  }

  withAction(action: string): this {
    this.props.action = action;
    return this;
  }

  withType(type: string): this {
    this.props.type = type;
    return this;
  }

  withTeamId(teamId: string): this {
    this.props.teamId = teamId;
    return this;
  }

  withData(data: Record<string, unknown>): this {
    this.props.data = data;
    return this;
  }

  withWebhookSecret(secret: string): this {
    this.props.webhookSecret = secret;
    return this;
  }

  build(): BuiltWebhookEvent {
    const rawBody = JSON.stringify({
      action: this.props.action,
      type: this.props.type,
      data: this.props.data,
    });
    const signature = createHmac('sha256', this.props.webhookSecret)
      .update(rawBody)
      .digest('hex');

    return {
      deliveryId: this.props.deliveryId,
      action: this.props.action,
      type: this.props.type,
      teamId: this.props.teamId,
      data: this.props.data,
      rawBody,
      signature,
      webhookSecret: this.props.webhookSecret,
    };
  }
}
