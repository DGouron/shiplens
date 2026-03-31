import { describe, it, expect } from 'vitest';
import { WebhookEvent } from '@modules/synchronization/entities/webhook-event/webhook-event.js';
import { createHmac } from 'crypto';

function computeSignature(rawBody: string, secret: string): string {
  return createHmac('sha256', secret).update(rawBody).digest('hex');
}

describe('WebhookEvent', () => {
  describe('verifySignature', () => {
    it('returns true for a valid HMAC SHA-256 signature', () => {
      const rawBody = '{"action":"create"}';
      const secret = 'webhook-secret';
      const signature = computeSignature(rawBody, secret);

      const result = WebhookEvent.verifySignature(rawBody, signature, secret);

      expect(result).toBe(true);
    });

    it('returns false for an invalid signature', () => {
      const rawBody = '{"action":"create"}';
      const secret = 'webhook-secret';
      const signature = 'invalid-signature-hex';

      const result = WebhookEvent.verifySignature(rawBody, signature, secret);

      expect(result).toBe(false);
    });

    it('returns false for a tampered body', () => {
      const originalBody = '{"action":"create"}';
      const secret = 'webhook-secret';
      const signature = computeSignature(originalBody, secret);

      const result = WebhookEvent.verifySignature('tampered-body', signature, secret);

      expect(result).toBe(false);
    });
  });

  describe('isSupportedEvent', () => {
    it('returns true for create Issue', () => {
      expect(WebhookEvent.isSupportedEvent('create', 'Issue')).toBe(true);
    });

    it('returns true for update Issue', () => {
      expect(WebhookEvent.isSupportedEvent('update', 'Issue')).toBe(true);
    });

    it('returns true for remove Issue', () => {
      expect(WebhookEvent.isSupportedEvent('remove', 'Issue')).toBe(true);
    });

    it('returns true for create Cycle', () => {
      expect(WebhookEvent.isSupportedEvent('create', 'Cycle')).toBe(true);
    });

    it('returns true for update Cycle', () => {
      expect(WebhookEvent.isSupportedEvent('update', 'Cycle')).toBe(true);
    });

    it('returns true for create Comment', () => {
      expect(WebhookEvent.isSupportedEvent('create', 'Comment')).toBe(true);
    });

    it('returns false for unsupported type', () => {
      expect(WebhookEvent.isSupportedEvent('create', 'Project')).toBe(false);
    });

    it('returns false for unsupported action on Comment', () => {
      expect(WebhookEvent.isSupportedEvent('remove', 'Comment')).toBe(false);
    });
  });

  describe('create', () => {
    it('creates a webhook event with pending status', () => {
      const event = WebhookEvent.create({
        deliveryId: 'delivery-1',
        action: 'create',
        type: 'Issue',
        teamId: 'team-1',
        data: { externalId: 'issue-1' },
        receivedAt: '2026-03-31T00:00:00Z',
      });

      expect(event.deliveryId).toBe('delivery-1');
      expect(event.action).toBe('create');
      expect(event.type).toBe('Issue');
      expect(event.teamId).toBe('team-1');
      expect(event.status).toBe('pending');
      expect(event.attempts).toBe(0);
    });
  });

  describe('markAsProcessed', () => {
    it('sets status to processed and records processedAt', () => {
      const event = WebhookEvent.create({
        deliveryId: 'delivery-1',
        action: 'create',
        type: 'Issue',
        teamId: 'team-1',
        data: {},
        receivedAt: '2026-03-31T00:00:00Z',
      });

      const processed = event.markAsProcessed('2026-03-31T01:00:00Z');

      expect(processed.status).toBe('processed');
      expect(processed.processedAt).toBe('2026-03-31T01:00:00Z');
    });
  });

  describe('markAsFailed', () => {
    it('sets status to failed with error message', () => {
      const event = WebhookEvent.create({
        deliveryId: 'delivery-1',
        action: 'create',
        type: 'Issue',
        teamId: 'team-1',
        data: {},
        receivedAt: '2026-03-31T00:00:00Z',
      });

      const failed = event.markAsFailed('Something went wrong');

      expect(failed.status).toBe('failed');
      expect(failed.errorMessage).toBe('Something went wrong');
    });
  });

  describe('incrementAttempts', () => {
    it('increments the attempt count by one', () => {
      const event = WebhookEvent.create({
        deliveryId: 'delivery-1',
        action: 'create',
        type: 'Issue',
        teamId: 'team-1',
        data: {},
        receivedAt: '2026-03-31T00:00:00Z',
      });

      const incremented = event.incrementAttempts();

      expect(incremented.attempts).toBe(1);
    });
  });
});
