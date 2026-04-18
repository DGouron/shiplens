import { UnverifiedWebhookSignatureError } from '@modules/synchronization/entities/webhook-event/webhook-event.errors.js';
import { StubIssueDataGateway } from '@modules/synchronization/testing/good-path/stub.issue-data.gateway.js';
import { StubTeamSelectionGateway } from '@modules/synchronization/testing/good-path/stub.team-selection.gateway.js';
import { StubWebhookEventGateway } from '@modules/synchronization/testing/good-path/stub.webhook-event.gateway.js';
import { ProcessWebhookEventUsecase } from '@modules/synchronization/usecases/process-webhook-event.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { TeamSelectionBuilder } from '../../../builders/team-selection.builder.js';
import { WebhookEventBuilder } from '../../../builders/webhook-event.builder.js';

describe('ProcessWebhookEventUsecase', () => {
  let webhookEventGateway: StubWebhookEventGateway;
  let issueDataGateway: StubIssueDataGateway;
  let teamSelectionGateway: StubTeamSelectionGateway;
  let usecase: ProcessWebhookEventUsecase;

  beforeEach(() => {
    webhookEventGateway = new StubWebhookEventGateway();
    issueDataGateway = new StubIssueDataGateway();
    teamSelectionGateway = new StubTeamSelectionGateway();

    teamSelectionGateway.selection = new TeamSelectionBuilder()
      .withSelectedTeams([{ teamId: 'team-1', teamName: 'Engineering' }])
      .withSelectedProjects([])
      .build();

    usecase = new ProcessWebhookEventUsecase(
      webhookEventGateway,
      issueDataGateway,
      teamSelectionGateway,
    );
  });

  describe('signature verification', () => {
    it('rejects unverified signature', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Issue')
        .build();

      await expect(
        usecase.execute({
          rawBody: 'tampered-body',
          signature: 'bad-sig',
          webhookSecret: 'secret',
          deliveryId: event.deliveryId,
          action: event.action,
          type: event.type,
          teamId: event.teamId,
          data: event.data,
        }),
      ).rejects.toThrow(UnverifiedWebhookSignatureError);
    });
  });

  describe('team filtering', () => {
    it('ignores events for unselected teams', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Issue')
        .withTeamId('unselected-team')
        .build();

      await usecase.execute({
        rawBody: event.rawBody,
        signature: event.signature,
        webhookSecret: event.webhookSecret,
        deliveryId: event.deliveryId,
        action: event.action,
        type: event.type,
        teamId: event.teamId,
        data: event.data,
      });

      expect(issueDataGateway.upsertedIssues).toHaveLength(0);
    });
  });

  describe('idempotency', () => {
    it('processes same delivery only once', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Issue')
        .withTeamId('team-1')
        .withDeliveryId('delivery-dup')
        .withData({
          externalId: 'issue-1',
          teamId: 'team-1',
          title: 'Issue',
          statusName: 'Todo',
          statusType: 'unstarted',
          points: null,
          labelIds: '',
          assigneeName: null,
          projectExternalId: null,
          createdAt: '2026-03-31T00:00:00Z',
          updatedAt: '2026-03-31T00:00:00Z',
        })
        .build();

      const params = {
        rawBody: event.rawBody,
        signature: event.signature,
        webhookSecret: event.webhookSecret,
        deliveryId: event.deliveryId,
        action: event.action,
        type: event.type,
        teamId: event.teamId,
        data: event.data,
      };

      await usecase.execute(params);
      await usecase.execute(params);

      expect(issueDataGateway.upsertedIssues).toHaveLength(1);
    });
  });

  describe('unsupported events', () => {
    it('ignores unsupported event types', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Project')
        .withTeamId('team-1')
        .withData({ externalId: 'proj-1', teamId: 'team-1' })
        .build();

      await usecase.execute({
        rawBody: event.rawBody,
        signature: event.signature,
        webhookSecret: event.webhookSecret,
        deliveryId: event.deliveryId,
        action: event.action,
        type: event.type,
        teamId: event.teamId,
        data: event.data,
      });

      expect(issueDataGateway.upsertedIssues).toHaveLength(0);
    });
  });

  describe('issue processing', () => {
    it('upserts issue on create', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Issue')
        .withTeamId('team-1')
        .withData({
          externalId: 'issue-1',
          teamId: 'team-1',
          title: 'New issue',
          statusName: 'Todo',
          statusType: 'unstarted',
          points: null,
          labelIds: '',
          assigneeName: null,
          projectExternalId: null,
          createdAt: '2026-03-31T00:00:00Z',
          updatedAt: '2026-03-31T00:00:00Z',
        })
        .build();

      await usecase.execute({
        rawBody: event.rawBody,
        signature: event.signature,
        webhookSecret: event.webhookSecret,
        deliveryId: event.deliveryId,
        action: event.action,
        type: event.type,
        teamId: event.teamId,
        data: event.data,
      });

      expect(issueDataGateway.upsertedIssues).toHaveLength(1);
      expect(issueDataGateway.upsertedIssues[0].externalId).toBe('issue-1');
    });

    it('upserts issue and records transition on update with status change', async () => {
      const event = new WebhookEventBuilder()
        .withAction('update')
        .withType('Issue')
        .withTeamId('team-1')
        .withData({
          externalId: 'issue-1',
          teamId: 'team-1',
          title: 'Updated',
          statusName: 'Done',
          statusType: 'completed',
          points: 3,
          labelIds: '',
          assigneeName: 'Alice',
          projectExternalId: null,
          createdAt: '2026-03-31T00:00:00Z',
          updatedAt: '2026-03-31T01:00:00Z',
          previousStatusName: 'In Progress',
          previousStatusType: 'started',
        })
        .build();

      await usecase.execute({
        rawBody: event.rawBody,
        signature: event.signature,
        webhookSecret: event.webhookSecret,
        deliveryId: event.deliveryId,
        action: event.action,
        type: event.type,
        teamId: event.teamId,
        data: event.data,
      });

      expect(issueDataGateway.upsertedIssues).toHaveLength(1);
      expect(issueDataGateway.upsertedTransitions).toHaveLength(1);
      expect(issueDataGateway.upsertedTransitions[0].fromStatusName).toBe(
        'In Progress',
      );
      expect(issueDataGateway.upsertedTransitions[0].toStatusName).toBe('Done');
    });

    it('soft deletes issue on remove', async () => {
      const event = new WebhookEventBuilder()
        .withAction('remove')
        .withType('Issue')
        .withTeamId('team-1')
        .withData({
          externalId: 'issue-1',
          teamId: 'team-1',
        })
        .build();

      await usecase.execute({
        rawBody: event.rawBody,
        signature: event.signature,
        webhookSecret: event.webhookSecret,
        deliveryId: event.deliveryId,
        action: event.action,
        type: event.type,
        teamId: event.teamId,
        data: event.data,
      });

      expect(issueDataGateway.softDeletedIssues).toHaveLength(1);
      expect(issueDataGateway.softDeletedIssues[0].externalId).toBe('issue-1');
    });
  });

  describe('cycle processing', () => {
    it('upserts cycle on create', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Cycle')
        .withTeamId('team-1')
        .withData({
          externalId: 'cycle-1',
          teamId: 'team-1',
          name: 'Sprint 1',
          number: 1,
          startsAt: '2026-03-31T00:00:00Z',
          endsAt: '2026-04-14T00:00:00Z',
          issueExternalIds: 'issue-1,issue-2',
        })
        .build();

      await usecase.execute({
        rawBody: event.rawBody,
        signature: event.signature,
        webhookSecret: event.webhookSecret,
        deliveryId: event.deliveryId,
        action: event.action,
        type: event.type,
        teamId: event.teamId,
        data: event.data,
      });

      expect(issueDataGateway.upsertedCycles).toHaveLength(1);
      expect(issueDataGateway.upsertedCycles[0].externalId).toBe('cycle-1');
    });
  });

  describe('comment processing', () => {
    it('creates comment on create', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Comment')
        .withTeamId('team-1')
        .withData({
          externalId: 'comment-1',
          issueExternalId: 'issue-1',
          teamId: 'team-1',
          body: 'A comment',
          authorName: 'Alice',
          createdAt: '2026-03-31T00:00:00Z',
        })
        .build();

      await usecase.execute({
        rawBody: event.rawBody,
        signature: event.signature,
        webhookSecret: event.webhookSecret,
        deliveryId: event.deliveryId,
        action: event.action,
        type: event.type,
        teamId: event.teamId,
        data: event.data,
      });

      expect(issueDataGateway.createdComments).toHaveLength(1);
      expect(issueDataGateway.createdComments[0].externalId).toBe('comment-1');
    });
  });

  describe('retry logic', () => {
    it('retries on temporary failure and succeeds', async () => {
      issueDataGateway.failNextUpsertIssue(1);

      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Issue')
        .withTeamId('team-1')
        .withData({
          externalId: 'issue-1',
          teamId: 'team-1',
          title: 'Issue',
          statusName: 'Todo',
          statusType: 'unstarted',
          points: null,
          labelIds: '',
          assigneeName: null,
          projectExternalId: null,
          createdAt: '2026-03-31T00:00:00Z',
          updatedAt: '2026-03-31T00:00:00Z',
        })
        .build();

      await usecase.execute({
        rawBody: event.rawBody,
        signature: event.signature,
        webhookSecret: event.webhookSecret,
        deliveryId: event.deliveryId,
        action: event.action,
        type: event.type,
        teamId: event.teamId,
        data: event.data,
      });

      expect(issueDataGateway.upsertedIssues).toHaveLength(1);
      const storedEvent = webhookEventGateway.events.get(event.deliveryId);
      expect(storedEvent?.status).toBe('processed');
    });

    it('marks as failed after repeated failures', async () => {
      issueDataGateway.failNextUpsertIssue(5);

      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Issue')
        .withTeamId('team-1')
        .withData({
          externalId: 'issue-1',
          teamId: 'team-1',
          title: 'Issue',
          statusName: 'Todo',
          statusType: 'unstarted',
          points: null,
          labelIds: '',
          assigneeName: null,
          projectExternalId: null,
          createdAt: '2026-03-31T00:00:00Z',
          updatedAt: '2026-03-31T00:00:00Z',
        })
        .build();

      await usecase.execute({
        rawBody: event.rawBody,
        signature: event.signature,
        webhookSecret: event.webhookSecret,
        deliveryId: event.deliveryId,
        action: event.action,
        type: event.type,
        teamId: event.teamId,
        data: event.data,
      });

      const storedEvent = webhookEventGateway.events.get(event.deliveryId);
      expect(storedEvent?.status).toBe('failed');
      expect(storedEvent?.attempts).toBeGreaterThanOrEqual(3);
    });
  });
});
