import { completedIssueDriftSchema } from '@modules/analytics/entities/drifting-issue/completed-issue-drift.schema.js';
import { describe, expect, it } from 'vitest';

describe('completedIssueDriftSchema', () => {
  it('accepts a valid completed issue drift input', () => {
    const result = completedIssueDriftSchema.safeParse({
      issueExternalId: 'ISSUE-1',
      assigneeName: 'Alice',
      points: 3,
      startedAt: '2026-04-01T09:00:00Z',
      completedAt: '2026-04-02T17:00:00Z',
    });

    expect(result.success).toBe(true);
  });

  it('accepts nullable fields as null', () => {
    const result = completedIssueDriftSchema.safeParse({
      issueExternalId: 'ISSUE-2',
      assigneeName: null,
      points: null,
      startedAt: null,
      completedAt: null,
    });

    expect(result.success).toBe(true);
  });

  it('rejects when issueExternalId is empty', () => {
    const result = completedIssueDriftSchema.safeParse({
      issueExternalId: '',
      assigneeName: 'Alice',
      points: 3,
      startedAt: '2026-04-01T09:00:00Z',
      completedAt: '2026-04-02T17:00:00Z',
    });

    expect(result.success).toBe(false);
  });
});
