import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { WebhookEvent } from '../entities/webhook-event/webhook-event.js';
import { WebhookEventGateway } from '../entities/webhook-event/webhook-event.gateway.js';
import { IssueDataGateway } from '../entities/issue-data/issue-data.gateway.js';
import { TeamSelectionGateway } from '../entities/team-selection/team-selection.gateway.js';
import { UnverifiedWebhookSignatureError } from '../entities/webhook-event/webhook-event.errors.js';
import {
  webhookIssueDataSchema,
  webhookIssueDeleteDataSchema,
} from '../entities/webhook-event/webhook-event.schema.js';
import { issueDataSchema } from '../entities/issue-data/issue-data.schema.js';
import { cycleDataSchema } from '../entities/issue-data/issue-data.schema.js';
import { commentDataSchema } from '../entities/issue-data/issue-data.schema.js';
import { stateTransitionDataSchema } from '../entities/issue-data/issue-data.schema.js';

interface ProcessWebhookEventParams {
  rawBody: string;
  signature: string;
  webhookSecret: string;
  deliveryId: string;
  action: string;
  type: string;
  teamId: string;
  data: Record<string, unknown>;
}

const MAX_RETRIES = 3;

@Injectable()
export class ProcessWebhookEventUsecase implements Usecase<ProcessWebhookEventParams, void> {
  constructor(
    private readonly webhookEventGateway: WebhookEventGateway,
    private readonly issueDataGateway: IssueDataGateway,
    private readonly teamSelectionGateway: TeamSelectionGateway,
  ) {}

  async execute(params: ProcessWebhookEventParams): Promise<void> {
    const isValid = WebhookEvent.verifySignature(
      params.rawBody,
      params.signature,
      params.webhookSecret,
    );
    if (!isValid) {
      throw new UnverifiedWebhookSignatureError();
    }

    const alreadyProcessed = await this.webhookEventGateway.hasBeenProcessed(params.deliveryId);
    if (alreadyProcessed) {
      return;
    }

    const selection = await this.teamSelectionGateway.get();
    if (!selection) {
      return;
    }

    const isTeamSelected = selection.selectedTeams.some(
      (team) => team.teamId === params.teamId,
    );
    if (!isTeamSelected) {
      return;
    }

    if (!WebhookEvent.isSupportedEvent(params.action, params.type)) {
      return;
    }

    const event = WebhookEvent.create({
      deliveryId: params.deliveryId,
      action: params.action,
      type: params.type,
      teamId: params.teamId,
      data: params.data,
      receivedAt: new Date().toISOString(),
    });

    await this.processWithRetry(event, params);
  }

  private async processWithRetry(
    event: WebhookEvent,
    params: ProcessWebhookEventParams,
  ): Promise<void> {
    let currentEvent = event;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      currentEvent = currentEvent.incrementAttempts();
      try {
        await this.routeEvent(params.action, params.type, params.data);
        const processed = currentEvent.markAsProcessed(new Date().toISOString());
        await this.webhookEventGateway.save(processed);
        return;
      } catch {
        if (attempt === MAX_RETRIES - 1) {
          const failed = currentEvent.markAsFailed('Max retries exceeded');
          await this.webhookEventGateway.save(failed);
          return;
        }
      }
    }
  }

  private async routeEvent(
    action: string,
    type: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    if (type === 'Issue') {
      await this.handleIssueEvent(action, data);
    } else if (type === 'Cycle') {
      await this.handleCycleEvent(data);
    } else if (type === 'Comment') {
      await this.handleCommentEvent(data);
    }
  }

  private async handleIssueEvent(
    action: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    if (action === 'remove') {
      const parsed = webhookIssueDeleteDataSchema.parse(data);
      await this.issueDataGateway.softDeleteIssue(parsed.externalId, parsed.teamId);
      return;
    }

    const webhookData = webhookIssueDataSchema.parse(data);
    const issueData = issueDataSchema.parse({
      externalId: webhookData.externalId,
      teamId: webhookData.teamId,
      title: webhookData.title,
      statusName: webhookData.statusName,
      points: webhookData.points,
      labelIds: webhookData.labelIds,
      assigneeName: webhookData.assigneeName,
      createdAt: webhookData.createdAt,
      updatedAt: webhookData.updatedAt,
    });
    await this.issueDataGateway.upsertIssue(issueData);

    if (action === 'update' && webhookData.previousStatusName) {
      const transition = stateTransitionDataSchema.parse({
        externalId: `${webhookData.externalId}-${webhookData.updatedAt}`,
        issueExternalId: webhookData.externalId,
        teamId: webhookData.teamId,
        fromStatusName: webhookData.previousStatusName,
        toStatusName: webhookData.statusName,
        occurredAt: webhookData.updatedAt,
      });
      await this.issueDataGateway.upsertTransition(transition);
    }
  }

  private async handleCycleEvent(data: Record<string, unknown>): Promise<void> {
    const cycleData = cycleDataSchema.parse(data);
    await this.issueDataGateway.upsertCycle(cycleData);
  }

  private async handleCommentEvent(data: Record<string, unknown>): Promise<void> {
    const comment = commentDataSchema.parse(data);
    await this.issueDataGateway.createComment(comment);
  }
}
