import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { WebhookEventGateway } from '../../entities/webhook-event/webhook-event.gateway.js';
import { type WebhookEvent } from '../../entities/webhook-event/webhook-event.js';

@Injectable()
export class WebhookEventInPrismaGateway extends WebhookEventGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async hasBeenProcessed(deliveryId: string): Promise<boolean> {
    const event = await this.prisma.webhookEvent.findUnique({
      where: { deliveryId },
    });
    return event?.status === 'processed';
  }

  async save(event: WebhookEvent): Promise<void> {
    await this.prisma.webhookEvent.upsert({
      where: { deliveryId: event.deliveryId },
      create: {
        deliveryId: event.deliveryId,
        action: event.action,
        type: event.type,
        teamId: event.teamId,
        status: event.status,
        attempts: event.attempts,
        receivedAt: event.receivedAt,
        processedAt: event.processedAt,
        errorMessage: event.errorMessage,
      },
      update: {
        status: event.status,
        attempts: event.attempts,
        processedAt: event.processedAt,
        errorMessage: event.errorMessage,
      },
    });
  }
}
