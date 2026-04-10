import { type DriftingIssueInput } from '@modules/analytics/entities/drifting-issue/drifting-issue.schema.js';
import { StubDriftingIssueDetectionDataGateway } from '@modules/analytics/testing/good-path/stub.drifting-issue-detection-data.gateway.js';
import { StubTeamSettingsGateway } from '@modules/analytics/testing/good-path/stub.team-settings.gateway.js';
import { DetectDriftingIssuesUsecase } from '@modules/analytics/usecases/detect-drifting-issues.usecase.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function makeIssue(
  overrides: Partial<DriftingIssueInput> = {},
): DriftingIssueInput {
  return {
    issueExternalId: 'ISSUE-1',
    issueTitle: 'Fix login bug',
    issueUuid: 'uuid-1',
    teamId: 'team-1',
    points: 3,
    statusName: 'In Progress',
    statusType: 'started',
    startedAt: '2026-04-06T07:00:00Z',
    ...overrides,
  };
}

describe('DetectDriftingIssuesUsecase', () => {
  let usecase: DetectDriftingIssuesUsecase;
  let detectionDataGateway: StubDriftingIssueDetectionDataGateway;
  let teamSettingsGateway: StubTeamSettingsGateway;

  beforeEach(() => {
    detectionDataGateway = new StubDriftingIssueDetectionDataGateway();
    teamSettingsGateway = new StubTeamSettingsGateway();
    usecase = new DetectDriftingIssuesUsecase(
      detectionDataGateway,
      teamSettingsGateway,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('detects a drifting 1-point ticket (8h business > 4h max)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T15:00:00Z')); // Monday 17h Paris

    detectionDataGateway.issues.set('team-1', [
      makeIssue({
        points: 1,
        startedAt: '2026-04-06T07:00:00Z', // Monday 9h Paris
        statusName: 'In Review',
      }),
    ]);

    const results = await usecase.execute({ teamId: 'team-1' });

    expect(results).toHaveLength(1);
    expect(results[0].driftStatus).toBe('drifting');
    expect(results[0].elapsedBusinessHours).toBe(8);
    expect(results[0].expectedMaxHours).toBe(4);
  });

  it('detects a drifting 5-point ticket (32h > 20h max)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-09T12:00:00Z')); // Thursday 14h Paris

    detectionDataGateway.issues.set('team-1', [
      makeIssue({
        points: 5,
        startedAt: '2026-04-06T07:00:00Z', // Monday 9h Paris
      }),
    ]);

    const results = await usecase.execute({ teamId: 'team-1' });

    expect(results).toHaveLength(1);
    expect(results[0].driftStatus).toBe('drifting');
    expect(results[0].elapsedBusinessHours).toBe(32);
    expect(results[0].expectedMaxHours).toBe(20);
  });

  it('does not alert for a 3-point ticket within threshold (6h < 8h)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T13:00:00Z')); // Monday 15h Paris

    detectionDataGateway.issues.set('team-1', [
      makeIssue({
        points: 3,
        startedAt: '2026-04-06T07:00:00Z',
      }),
    ]);

    const results = await usecase.execute({ teamId: 'team-1' });

    expect(results).toHaveLength(0);
  });

  it('flags 8-point ticket as needs-splitting immediately', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T07:00:00Z'));

    detectionDataGateway.issues.set('team-1', [makeIssue({ points: 8 })]);

    const results = await usecase.execute({ teamId: 'team-1' });

    expect(results).toHaveLength(1);
    expect(results[0].driftStatus).toBe('needs-splitting');
  });

  it('flags 13-point ticket as needs-splitting immediately', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T07:00:00Z'));

    detectionDataGateway.issues.set('team-1', [makeIssue({ points: 13 })]);

    const results = await usecase.execute({ teamId: 'team-1' });

    expect(results).toHaveLength(1);
    expect(results[0].driftStatus).toBe('needs-splitting');
  });

  it('excludes tickets without estimation', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-10T07:00:00Z'));

    detectionDataGateway.issues.set('team-1', [makeIssue({ points: null })]);

    const results = await usecase.execute({ teamId: 'team-1' });

    expect(results).toHaveLength(0);
  });

  it('counts business hours only (Fri 16h → Mon 10h = 3h, not drifting for 1pt)', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-13T08:00:00Z')); // Monday 10h Paris

    detectionDataGateway.issues.set('team-1', [
      makeIssue({
        points: 1,
        startedAt: '2026-04-10T14:00:00Z', // Friday 16h Paris
      }),
    ]);

    const results = await usecase.execute({ teamId: 'team-1' });

    expect(results).toHaveLength(0);
  });

  it('uses team timezone from settings', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-06T15:00:00Z')); // 17h Paris / 11h New York

    teamSettingsGateway.timezones.set('team-1', 'America/New_York');

    detectionDataGateway.issues.set('team-1', [
      makeIssue({
        points: 1,
        startedAt: '2026-04-06T13:00:00Z', // 9h New York
      }),
    ]);

    const results = await usecase.execute({ teamId: 'team-1' });

    // In New York: 9h → 11h = 2h business hours → on-track (< 4h)
    expect(results).toHaveLength(0);
  });

  it('returns empty array when no issues exist', async () => {
    const results = await usecase.execute({ teamId: 'team-1' });
    expect(results).toHaveLength(0);
  });
});
