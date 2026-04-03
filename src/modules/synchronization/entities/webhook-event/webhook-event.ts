import { createHmac, timingSafeEqual } from 'node:crypto';
import { webhookEventGuard } from './webhook-event.guard.js';
import { type WebhookEventProps } from './webhook-event.schema.js';

interface CreateWebhookEventParams {
  deliveryId: string;
  action: string;
  type: string;
  teamId: string;
  data: Record<string, unknown>;
  receivedAt: string;
}

const SUPPORTED_EVENTS = new Set([
  'create:Issue',
  'update:Issue',
  'remove:Issue',
  'create:Cycle',
  'update:Cycle',
  'create:Comment',
]);

export class WebhookEvent {
  private constructor(private readonly props: WebhookEventProps) {}

  static create(params: CreateWebhookEventParams): WebhookEvent {
    const validatedProps = webhookEventGuard.parse({
      ...params,
      status: 'pending',
      attempts: 0,
      processedAt: null,
      errorMessage: null,
    });
    return new WebhookEvent(validatedProps);
  }

  static fromProps(props: WebhookEventProps): WebhookEvent {
    return new WebhookEvent(props);
  }

  static verifySignature(
    rawBody: string,
    signature: string,
    secret: string,
  ): boolean {
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    if (expected.length !== signature.length) {
      return false;
    }
    try {
      return timingSafeEqual(
        Buffer.from(expected, 'hex'),
        Buffer.from(signature, 'hex'),
      );
    } catch {
      return false;
    }
  }

  static isSupportedEvent(action: string, type: string): boolean {
    return SUPPORTED_EVENTS.has(`${action}:${type}`);
  }

  get deliveryId(): string {
    return this.props.deliveryId;
  }

  get action(): string {
    return this.props.action;
  }

  get type(): string {
    return this.props.type;
  }

  get teamId(): string {
    return this.props.teamId;
  }

  get status(): string {
    return this.props.status;
  }

  get attempts(): number {
    return this.props.attempts;
  }

  get receivedAt(): string {
    return this.props.receivedAt;
  }

  get processedAt(): string | null {
    return this.props.processedAt;
  }

  get errorMessage(): string | null {
    return this.props.errorMessage;
  }

  get data(): Record<string, unknown> {
    return this.props.data;
  }

  markAsProcessed(processedAt: string): WebhookEvent {
    return new WebhookEvent({
      ...this.props,
      status: 'processed',
      processedAt,
    });
  }

  markAsFailed(errorMessage: string): WebhookEvent {
    return new WebhookEvent({
      ...this.props,
      status: 'failed',
      errorMessage,
    });
  }

  incrementAttempts(): WebhookEvent {
    return new WebhookEvent({
      ...this.props,
      attempts: this.props.attempts + 1,
    });
  }
}
