import {
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { type Request } from 'express';
import { UnverifiedWebhookSignatureError } from '../../entities/webhook-event/webhook-event.errors.js';
import { ProcessWebhookEventUsecase } from '../../usecases/process-webhook-event.usecase.js';

@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly processWebhookEvent: ProcessWebhookEventUsecase,
  ) {}

  @Post('linear')
  @HttpCode(200)
  async handleLinearWebhook(@Req() request: Request): Promise<void> {
    const rawBody = JSON.stringify(request.body);
    const signature = (request.headers['linear-signature'] as string) ?? '';
    const deliveryId = (request.headers['linear-delivery'] as string) ?? '';
    const webhookSecret = process.env.LINEAR_WEBHOOK_SIGNING_SECRET ?? '';
    const body = request.body as Record<string, unknown>;

    try {
      await this.processWebhookEvent.execute({
        rawBody,
        signature,
        webhookSecret,
        deliveryId,
        action: (body.action as string) ?? '',
        type: (body.type as string) ?? '',
        teamId: this.extractTeamId(body),
        data: (body.data as Record<string, unknown>) ?? {},
      });
    } catch (error) {
      if (error instanceof UnverifiedWebhookSignatureError) {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }
      throw error;
    }
  }

  private extractTeamId(body: Record<string, unknown>): string {
    const data = body.data as Record<string, unknown> | undefined;
    if (data && typeof data.teamId === 'string') {
      return data.teamId;
    }
    return '';
  }
}
