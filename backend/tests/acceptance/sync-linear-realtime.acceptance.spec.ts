import { StubIssueDataGateway } from '@modules/synchronization/testing/good-path/stub.issue-data.gateway.js';
import { StubTeamSelectionGateway } from '@modules/synchronization/testing/good-path/stub.team-selection.gateway.js';
import { StubWebhookEventGateway } from '@modules/synchronization/testing/good-path/stub.webhook-event.gateway.js';
import { ProcessWebhookEventUsecase } from '@modules/synchronization/usecases/process-webhook-event.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { TeamSelectionBuilder } from '../builders/team-selection.builder.js';
import { WebhookEventBuilder } from '../builders/webhook-event.builder.js';

describe('Sync Linear Realtime (acceptance)', () => {
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

  describe('only verified notifications from Linear are processed', () => {
    it('unverified notification: rejects with error message', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Issue')
        .build();

      await expect(
        usecase.execute({
          rawBody: 'tampered-body',
          signature: 'invalid-signature',
          webhookSecret: 'secret',
          deliveryId: event.deliveryId,
          action: event.action,
          type: event.type,
          teamId: event.teamId,
          data: event.data,
        }),
      ).rejects.toThrow('Notification ignorée : origine non vérifiée.');
    });
  });

  describe('supported event types are processed', () => {
    it('issue created in Linear: issue added in Shiplens', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Issue')
        .withTeamId('team-1')
        .withData({
          externalId: 'issue-ext-1',
          teamId: 'team-1',
          title: 'New issue',
          statusName: 'Todo',
          statusType: 'unstarted',
          points: null,
          labelIds: '',
          assigneeName: null,
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

      const issues = issueDataGateway.upsertedIssues;
      expect(issues).toHaveLength(1);
      expect(issues[0].externalId).toBe('issue-ext-1');
    });

    it('issue modified in Linear: issue updated with state transition', async () => {
      const event = new WebhookEventBuilder()
        .withAction('update')
        .withType('Issue')
        .withTeamId('team-1')
        .withData({
          externalId: 'issue-ext-1',
          teamId: 'team-1',
          title: 'Updated issue',
          statusName: 'Done',
          statusType: 'completed',
          points: 3,
          labelIds: '',
          assigneeName: 'Alice',
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

      const issues = issueDataGateway.upsertedIssues;
      expect(issues).toHaveLength(1);
      expect(issues[0].statusName).toBe('Done');

      const transitions = issueDataGateway.upsertedTransitions;
      expect(transitions).toHaveLength(1);
      expect(transitions[0].fromStatusName).toBe('In Progress');
      expect(transitions[0].toStatusName).toBe('Done');
    });

    it('issue deleted in Linear: issue soft-deleted in Shiplens', async () => {
      const event = new WebhookEventBuilder()
        .withAction('remove')
        .withType('Issue')
        .withTeamId('team-1')
        .withData({
          externalId: 'issue-ext-1',
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

      const deletedIssues = issueDataGateway.softDeletedIssues;
      expect(deletedIssues).toHaveLength(1);
      expect(deletedIssues[0].externalId).toBe('issue-ext-1');
    });

    it('cycle created in Linear: cycle added in Shiplens', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Cycle')
        .withTeamId('team-1')
        .withData({
          externalId: 'cycle-ext-1',
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

      const cycles = issueDataGateway.upsertedCycles;
      expect(cycles).toHaveLength(1);
      expect(cycles[0].externalId).toBe('cycle-ext-1');
    });

    it('comment added in Linear: comment added in Shiplens', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Comment')
        .withTeamId('team-1')
        .withData({
          externalId: 'comment-ext-1',
          issueExternalId: 'issue-ext-1',
          teamId: 'team-1',
          body: 'This is a comment',
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

      const comments = issueDataGateway.createdComments;
      expect(comments).toHaveLength(1);
      expect(comments[0].externalId).toBe('comment-ext-1');
    });
  });

  describe('events for unselected teams are ignored', () => {
    it('event on unselected team: ignored silently', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Issue')
        .withTeamId('unselected-team')
        .withData({
          externalId: 'issue-ext-1',
          teamId: 'unselected-team',
          title: 'New issue',
          statusName: 'Todo',
          statusType: 'unstarted',
          points: null,
          labelIds: '',
          assigneeName: null,
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

      expect(issueDataGateway.upsertedIssues).toHaveLength(0);
    });
  });

  describe('duplicate events produce only one modification', () => {
    it('same event received twice: only one modification applied', async () => {
      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Issue')
        .withTeamId('team-1')
        .withDeliveryId('delivery-123')
        .withData({
          externalId: 'issue-ext-1',
          teamId: 'team-1',
          title: 'New issue',
          statusName: 'Todo',
          statusType: 'unstarted',
          points: null,
          labelIds: '',
          assigneeName: null,
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

  describe('unsupported event types are ignored', () => {
    it('unsupported event type: ignored silently', async () => {
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

  describe('failed event processing is retried automatically', () => {
    it('temporary failure: event retried and processed successfully', async () => {
      issueDataGateway.failNextUpsertIssue(1);

      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Issue')
        .withTeamId('team-1')
        .withData({
          externalId: 'issue-ext-1',
          teamId: 'team-1',
          title: 'New issue',
          statusName: 'Todo',
          statusType: 'unstarted',
          points: null,
          labelIds: '',
          assigneeName: null,
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

    it('repeated failure: event isolated for analysis', async () => {
      issueDataGateway.failNextUpsertIssue(5);

      const event = new WebhookEventBuilder()
        .withAction('create')
        .withType('Issue')
        .withTeamId('team-1')
        .withData({
          externalId: 'issue-ext-1',
          teamId: 'team-1',
          title: 'New issue',
          statusName: 'Todo',
          statusType: 'unstarted',
          points: null,
          labelIds: '',
          assigneeName: null,
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
