import { DriftingIssue } from '@modules/analytics/entities/drifting-issue/drifting-issue.js';
import { DriftingIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/drifting-issues.presenter.js';
import { describe, expect, it } from 'vitest';

const PARIS = 'Europe/Paris';

function makeDriftingIssue(
  overrides: Record<string, unknown> = {},
): DriftingIssue {
  const input = {
    issueExternalId: 'ISSUE-1',
    issueTitle: 'Fix login bug',
    issueUuid: 'uuid-1',
    teamId: 'team-1',
    points: 1,
    statusName: 'In Review',
    statusType: 'started',
    startedAt: '2026-04-06T07:00:00Z',
    assigneeName: null,
    ...overrides,
  };
  const now = '2026-04-06T15:00:00Z'; // 8h business hours later
  const result = DriftingIssue.analyze(input, now, PARIS);
  if (!result) throw new Error('Expected a DriftingIssue');
  return result;
}

describe('DriftingIssuesPresenter', () => {
  const presenter = new DriftingIssuesPresenter();

  it('formats a drifting issue into a DTO', () => {
    const issue = makeDriftingIssue();

    const [dto] = presenter.present([issue]);

    expect(dto.issueExternalId).toBe('ISSUE-1');
    expect(dto.issueTitle).toBe('Fix login bug');
    expect(dto.teamId).toBe('team-1');
    expect(dto.statusName).toBe('In Review');
    expect(dto.points).toBe(1);
    expect(dto.driftStatus).toBe('drifting');
    expect(dto.elapsedBusinessHours).toBe(8);
    expect(dto.expectedMaxHours).toBe(4);
    expect(dto.issueUrl).toBe('https://linear.app/issue/uuid-1');
  });

  it('formats a needs-splitting issue with null expectedMaxHours', () => {
    const input = {
      issueExternalId: 'ISSUE-2',
      issueTitle: 'Big feature',
      issueUuid: 'uuid-2',
      teamId: 'team-1',
      points: 8,
      statusName: 'In Progress',
      statusType: 'started',
      startedAt: '2026-04-06T07:00:00Z',
      assigneeName: null,
    };
    const issue = DriftingIssue.analyze(input, '2026-04-06T07:00:00Z', PARIS);
    if (!issue) throw new Error('Expected a DriftingIssue');

    const [dto] = presenter.present([issue]);

    expect(dto.driftStatus).toBe('needs-splitting');
    expect(dto.expectedMaxHours).toBeNull();
    expect(dto.elapsedBusinessHours).toBe(0);
  });

  it('returns empty array for no issues', () => {
    expect(presenter.present([])).toEqual([]);
  });

  it('presents the assignee name when the drifting issue carries one', () => {
    const issue = makeDriftingIssue({ assigneeName: 'Alice Martin' });

    const [dto] = presenter.present([issue]);

    expect(dto.assigneeName).toBe('Alice Martin');
  });

  it('presents a null assignee name when the drifting issue has no assignee', () => {
    const issue = makeDriftingIssue();

    const [dto] = presenter.present([issue]);

    expect(dto.assigneeName).toBeNull();
  });
});
