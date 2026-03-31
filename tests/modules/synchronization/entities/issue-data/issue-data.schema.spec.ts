import { describe, it, expect } from 'vitest';
import {
  issueDataSchema,
  cycleDataSchema,
  stateTransitionDataSchema,
  paginatedIssuesSchema,
} from '@modules/synchronization/entities/issue-data/issue-data.schema.js';

describe('IssueDataSchema', () => {
  it('validates a valid issue data', () => {
    const result = issueDataSchema.safeParse({
      externalId: 'issue-1',
      teamId: 'team-1',
      title: 'Fix login bug',
      statusName: 'In Progress',
      points: 3,
      labelIds: '["label-1","label-2"]',
      assigneeName: 'Alice Martin',
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-16T10:00:00Z',
    });

    expect(result.success).toBe(true);
  });

  it('accepts null points and assignee', () => {
    const result = issueDataSchema.safeParse({
      externalId: 'issue-1',
      teamId: 'team-1',
      title: 'Fix login bug',
      statusName: 'In Progress',
      points: null,
      labelIds: '[]',
      assigneeName: null,
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-16T10:00:00Z',
    });

    expect(result.success).toBe(true);
  });

  it('rejects issue without title', () => {
    const result = issueDataSchema.safeParse({
      externalId: 'issue-1',
      teamId: 'team-1',
      title: '',
      statusName: 'In Progress',
      points: null,
      labelIds: '[]',
      assigneeName: null,
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-16T10:00:00Z',
    });

    expect(result.success).toBe(false);
  });
});

describe('CycleDataSchema', () => {
  it('validates a valid cycle data', () => {
    const result = cycleDataSchema.safeParse({
      externalId: 'cycle-1',
      teamId: 'team-1',
      name: 'Sprint 1',
      startsAt: '2026-01-01T00:00:00Z',
      endsAt: '2026-01-14T00:00:00Z',
      issueExternalIds: '["issue-1","issue-2"]',
    });

    expect(result.success).toBe(true);
  });

  it('accepts null name', () => {
    const result = cycleDataSchema.safeParse({
      externalId: 'cycle-1',
      teamId: 'team-1',
      name: null,
      startsAt: '2026-01-01T00:00:00Z',
      endsAt: '2026-01-14T00:00:00Z',
      issueExternalIds: '[]',
    });

    expect(result.success).toBe(true);
  });
});

describe('StateTransitionDataSchema', () => {
  it('validates a valid state transition', () => {
    const result = stateTransitionDataSchema.safeParse({
      externalId: 'transition-1',
      issueExternalId: 'issue-1',
      teamId: 'team-1',
      fromStatusName: 'Todo',
      toStatusName: 'In Progress',
      occurredAt: '2026-01-15T10:00:00Z',
    });

    expect(result.success).toBe(true);
  });

  it('accepts null fromStatusName for initial transition', () => {
    const result = stateTransitionDataSchema.safeParse({
      externalId: 'transition-1',
      issueExternalId: 'issue-1',
      teamId: 'team-1',
      fromStatusName: null,
      toStatusName: 'Backlog',
      occurredAt: '2026-01-15T10:00:00Z',
    });

    expect(result.success).toBe(true);
  });
});

describe('PaginatedIssuesSchema', () => {
  it('validates paginated issues with cursor', () => {
    const result = paginatedIssuesSchema.safeParse({
      issues: [
        {
          externalId: 'issue-1',
          teamId: 'team-1',
          title: 'Fix bug',
          statusName: 'Todo',
          points: null,
          labelIds: '[]',
          assigneeName: null,
          createdAt: '2026-01-15T10:00:00Z',
          updatedAt: '2026-01-16T10:00:00Z',
        },
      ],
      hasNextPage: true,
      endCursor: 'cursor-abc',
    });

    expect(result.success).toBe(true);
  });

  it('validates last page with null cursor', () => {
    const result = paginatedIssuesSchema.safeParse({
      issues: [],
      hasNextPage: false,
      endCursor: null,
    });

    expect(result.success).toBe(true);
  });
});
