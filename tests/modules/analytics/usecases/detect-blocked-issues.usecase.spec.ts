import { describe, it, expect, beforeEach } from 'vitest';
import { DetectBlockedIssuesUsecase } from '@modules/analytics/usecases/detect-blocked-issues.usecase.js';
import { StubStatusThresholdGateway } from '@modules/analytics/testing/good-path/stub.status-threshold.gateway.js';
import { StubBlockedIssueAlertGateway } from '@modules/analytics/testing/good-path/stub.blocked-issue-alert.gateway.js';
import { StubBlockedIssueDetectionDataGateway } from '@modules/analytics/testing/good-path/stub.blocked-issue-detection-data.gateway.js';
import { StubTeamSettingsGateway } from '@modules/analytics/testing/good-path/stub.team-settings.gateway.js';
import { NoSynchronizedDataError } from '@modules/analytics/entities/blocked-issue-alert/blocked-issue-alert.errors.js';
import { StatusThresholdBuilder } from '../../../builders/status-threshold.builder.js';
import { BlockedIssueAlertBuilder } from '../../../builders/blocked-issue-alert.builder.js';

describe('DetectBlockedIssuesUsecase', () => {
  let usecase: DetectBlockedIssuesUsecase;
  let thresholdGateway: StubStatusThresholdGateway;
  let alertGateway: StubBlockedIssueAlertGateway;
  let detectionDataGateway: StubBlockedIssueDetectionDataGateway;
  let teamSettingsGateway: StubTeamSettingsGateway;

  beforeEach(() => {
    thresholdGateway = new StubStatusThresholdGateway();
    alertGateway = new StubBlockedIssueAlertGateway();
    detectionDataGateway = new StubBlockedIssueDetectionDataGateway();
    teamSettingsGateway = new StubTeamSettingsGateway();
    usecase = new DetectBlockedIssuesUsecase(
      thresholdGateway,
      alertGateway,
      detectionDataGateway,
      teamSettingsGateway,
    );
  });

  it('rejects when no synchronized data', async () => {
    detectionDataGateway.hasSyncData = false;

    await expect(usecase.execute()).rejects.toThrow(NoSynchronizedDataError);
  });

  it('creates a warning alert when issue exceeds threshold', async () => {
    detectionDataGateway.issuesWithCurrentStatus = [
      {
        issueExternalId: 'issue-1',
        issueTitle: 'Fix login bug',
        issueUuid: 'uuid-1',
        statusName: 'In Review',
        statusEnteredAt: new Date(
          Date.now() - 50 * 60 * 60 * 1000,
        ).toISOString(),
        teamId: 'team-1',
      },
    ];

    await usecase.execute();

    const alerts = alertGateway.alerts;
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('warning');
    expect(alerts[0].durationHours).toBeGreaterThanOrEqual(50);
    expect(alerts[0].active).toBe(true);
  });

  it('creates a critical alert when issue exceeds double threshold', async () => {
    detectionDataGateway.issuesWithCurrentStatus = [
      {
        issueExternalId: 'issue-1',
        issueTitle: 'Fix login bug',
        issueUuid: 'uuid-1',
        statusName: 'In Review',
        statusEnteredAt: new Date(
          Date.now() - 100 * 60 * 60 * 1000,
        ).toISOString(),
        teamId: 'team-1',
      },
    ];

    await usecase.execute();

    const alerts = alertGateway.alerts;
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('critical');
  });

  it('does not create alert when issue is within threshold', async () => {
    detectionDataGateway.issuesWithCurrentStatus = [
      {
        issueExternalId: 'issue-1',
        issueTitle: 'Fix login bug',
        issueUuid: 'uuid-1',
        statusName: 'In Review',
        statusEnteredAt: new Date(
          Date.now() - 24 * 60 * 60 * 1000,
        ).toISOString(),
        teamId: 'team-1',
      },
    ];

    await usecase.execute();

    expect(alertGateway.alerts).toHaveLength(0);
  });

  it('uses custom thresholds over defaults', async () => {
    const customThreshold = new StatusThresholdBuilder()
      .withStatusName('In Progress')
      .withThresholdHours(72)
      .build();
    thresholdGateway.thresholds = [customThreshold];

    detectionDataGateway.issuesWithCurrentStatus = [
      {
        issueExternalId: 'issue-1',
        issueTitle: 'Slow task',
        issueUuid: 'uuid-1',
        statusName: 'In Progress',
        statusEnteredAt: new Date(
          Date.now() - 80 * 60 * 60 * 1000,
        ).toISOString(),
        teamId: 'team-1',
      },
    ];

    await usecase.execute();

    const alerts = alertGateway.alerts;
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe('warning');
    expect(alerts[0].durationHours).toBeGreaterThanOrEqual(80);
  });

  it('resolves previously active alerts when issue is no longer blocked', async () => {
    const existingAlert = new BlockedIssueAlertBuilder()
      .withIssueExternalId('issue-1')
      .withActive(true)
      .build();
    alertGateway.alerts = [existingAlert];

    detectionDataGateway.issuesWithCurrentStatus = [];

    await usecase.execute();

    expect(alertGateway.alerts[0].active).toBe(false);
    expect(alertGateway.alerts[0].resolvedAt).not.toBeNull();
  });

  it('updates existing alert when issue is still blocked', async () => {
    const existingAlert = new BlockedIssueAlertBuilder()
      .withIssueExternalId('issue-1')
      .withIssueUuid('uuid-1')
      .withStatusName('In Review')
      .withDurationHours(50)
      .withSeverity('warning')
      .withActive(true)
      .build();
    alertGateway.alerts = [existingAlert];

    detectionDataGateway.issuesWithCurrentStatus = [
      {
        issueExternalId: 'issue-1',
        issueTitle: 'Fix login bug',
        issueUuid: 'uuid-1',
        statusName: 'In Review',
        statusEnteredAt: new Date(
          Date.now() - 100 * 60 * 60 * 1000,
        ).toISOString(),
        teamId: 'team-1',
      },
    ];

    await usecase.execute();

    expect(alertGateway.alerts).toHaveLength(1);
    expect(alertGateway.alerts[0].severity).toBe('critical');
    expect(alertGateway.alerts[0].active).toBe(true);
  });

  it('ignores issues with status that has no threshold', async () => {
    detectionDataGateway.issuesWithCurrentStatus = [
      {
        issueExternalId: 'issue-1',
        issueTitle: 'Some issue',
        issueUuid: 'uuid-1',
        statusName: 'Done',
        statusEnteredAt: new Date(
          Date.now() - 500 * 60 * 60 * 1000,
        ).toISOString(),
        teamId: 'team-1',
      },
    ];

    await usecase.execute();

    expect(alertGateway.alerts).toHaveLength(0);
  });

  it('skips issues with excluded statuses for their team', async () => {
    teamSettingsGateway.excludedStatuses.set('team-1', ['Todo', 'In Review']);

    detectionDataGateway.issuesWithCurrentStatus = [
      {
        issueExternalId: 'issue-1',
        issueTitle: 'Blocked in review',
        issueUuid: 'uuid-1',
        statusName: 'In Review',
        statusEnteredAt: new Date(
          Date.now() - 100 * 60 * 60 * 1000,
        ).toISOString(),
        teamId: 'team-1',
      },
      {
        issueExternalId: 'issue-2',
        issueTitle: 'Blocked in progress',
        issueUuid: 'uuid-2',
        statusName: 'In Progress',
        statusEnteredAt: new Date(
          Date.now() - 100 * 60 * 60 * 1000,
        ).toISOString(),
        teamId: 'team-1',
      },
    ];

    await usecase.execute();

    expect(alertGateway.alerts).toHaveLength(1);
    expect(alertGateway.alerts[0].issueExternalId).toBe('issue-2');
  });

  it('does not exclude statuses for other teams', async () => {
    teamSettingsGateway.excludedStatuses.set('team-2', ['In Review']);

    detectionDataGateway.issuesWithCurrentStatus = [
      {
        issueExternalId: 'issue-1',
        issueTitle: 'Blocked in review',
        issueUuid: 'uuid-1',
        statusName: 'In Review',
        statusEnteredAt: new Date(
          Date.now() - 50 * 60 * 60 * 1000,
        ).toISOString(),
        teamId: 'team-1',
      },
    ];

    await usecase.execute();

    expect(alertGateway.alerts).toHaveLength(1);
  });
});
