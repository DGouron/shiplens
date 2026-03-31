import { describe, it, expect, beforeEach } from 'vitest';
import { DetectBlockedIssuesUsecase } from '@modules/analytics/usecases/detect-blocked-issues.usecase.js';
import { SetStatusThresholdUsecase } from '@modules/analytics/usecases/set-status-threshold.usecase.js';
import { GetBlockedIssuesUsecase } from '@modules/analytics/usecases/get-blocked-issues.usecase.js';
import { GetAlertHistoryUsecase } from '@modules/analytics/usecases/get-alert-history.usecase.js';
import { StubStatusThresholdGateway } from '@modules/analytics/testing/good-path/stub.status-threshold.gateway.js';
import { StubBlockedIssueAlertGateway } from '@modules/analytics/testing/good-path/stub.blocked-issue-alert.gateway.js';
import { StubBlockedIssueDetectionDataGateway } from '@modules/analytics/testing/good-path/stub.blocked-issue-detection-data.gateway.js';
import { StatusThresholdBuilder } from '../builders/status-threshold.builder.js';
import { BlockedIssueAlertBuilder } from '../builders/blocked-issue-alert.builder.js';

describe('Detect Blocked Issues (acceptance)', () => {
  let thresholdGateway: StubStatusThresholdGateway;
  let alertGateway: StubBlockedIssueAlertGateway;
  let detectionDataGateway: StubBlockedIssueDetectionDataGateway;
  let detectBlockedIssues: DetectBlockedIssuesUsecase;
  let setStatusThreshold: SetStatusThresholdUsecase;
  let getBlockedIssues: GetBlockedIssuesUsecase;
  let getAlertHistory: GetAlertHistoryUsecase;

  beforeEach(() => {
    thresholdGateway = new StubStatusThresholdGateway();
    alertGateway = new StubBlockedIssueAlertGateway();
    detectionDataGateway = new StubBlockedIssueDetectionDataGateway();
    detectBlockedIssues = new DetectBlockedIssuesUsecase(
      thresholdGateway,
      alertGateway,
      detectionDataGateway,
    );
    setStatusThreshold = new SetStatusThresholdUsecase(thresholdGateway);
    getBlockedIssues = new GetBlockedIssuesUsecase(alertGateway);
    getAlertHistory = new GetAlertHistoryUsecase(alertGateway);
  });

  describe('threshold-based detection produces warning or critical alerts', () => {
    it('issue blocked as warning: In Review for 50h with 48h threshold', async () => {
      detectionDataGateway.hasSyncData = true;
      detectionDataGateway.issuesWithCurrentStatus = [
        {
          issueExternalId: 'issue-1',
          issueTitle: 'Fix login bug',
          issueUuid: 'uuid-1',
          statusName: 'In Review',
          statusEnteredAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
          teamId: 'team-1',
        },
      ];

      await detectBlockedIssues.execute();

      const result = await getBlockedIssues.execute();
      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('warning');
      expect(result[0].durationHours).toBeGreaterThanOrEqual(50);
      expect(result[0].issueUrl).toContain('uuid-1');
    });

    it('issue blocked as critical: In Review for 100h with 48h threshold (double exceeded)', async () => {
      detectionDataGateway.hasSyncData = true;
      detectionDataGateway.issuesWithCurrentStatus = [
        {
          issueExternalId: 'issue-1',
          issueTitle: 'Fix login bug',
          issueUuid: 'uuid-1',
          statusName: 'In Review',
          statusEnteredAt: new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString(),
          teamId: 'team-1',
        },
      ];

      await detectBlockedIssues.execute();

      const result = await getBlockedIssues.execute();
      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('critical');
      expect(result[0].durationHours).toBeGreaterThanOrEqual(100);
    });

    it('issue within threshold: In Review for 24h with 48h threshold produces no alert', async () => {
      detectionDataGateway.hasSyncData = true;
      detectionDataGateway.issuesWithCurrentStatus = [
        {
          issueExternalId: 'issue-1',
          issueTitle: 'Fix login bug',
          issueUuid: 'uuid-1',
          statusName: 'In Review',
          statusEnteredAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          teamId: 'team-1',
        },
      ];

      await detectBlockedIssues.execute();

      const result = await getBlockedIssues.execute();
      expect(result).toHaveLength(0);
    });
  });

  describe('multiple blocked issues are sorted by severity', () => {
    it('3 blocked issues: 1 critical and 2 warnings sorted critical first', async () => {
      detectionDataGateway.hasSyncData = true;
      detectionDataGateway.issuesWithCurrentStatus = [
        {
          issueExternalId: 'issue-1',
          issueTitle: 'Warning 1',
          issueUuid: 'uuid-1',
          statusName: 'In Review',
          statusEnteredAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
          teamId: 'team-1',
        },
        {
          issueExternalId: 'issue-2',
          issueTitle: 'Critical 1',
          issueUuid: 'uuid-2',
          statusName: 'In Review',
          statusEnteredAt: new Date(Date.now() - 100 * 60 * 60 * 1000).toISOString(),
          teamId: 'team-1',
        },
        {
          issueExternalId: 'issue-3',
          issueTitle: 'Warning 2',
          issueUuid: 'uuid-3',
          statusName: 'In Progress',
          statusEnteredAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
          teamId: 'team-1',
        },
      ];

      await detectBlockedIssues.execute();

      const result = await getBlockedIssues.execute();
      expect(result).toHaveLength(3);
      expect(result[0].severity).toBe('critical');
      expect(result[1].severity).toBe('warning');
      expect(result[2].severity).toBe('warning');
    });
  });

  describe('custom thresholds override defaults', () => {
    it('user sets In Progress threshold to 72h, issue at 80h triggers warning', async () => {
      await setStatusThreshold.execute({ statusName: 'In Progress', thresholdHours: 72 });

      detectionDataGateway.hasSyncData = true;
      detectionDataGateway.issuesWithCurrentStatus = [
        {
          issueExternalId: 'issue-1',
          issueTitle: 'Slow task',
          issueUuid: 'uuid-1',
          statusName: 'In Progress',
          statusEnteredAt: new Date(Date.now() - 80 * 60 * 60 * 1000).toISOString(),
          teamId: 'team-1',
        },
      ];

      await detectBlockedIssues.execute();

      const result = await getBlockedIssues.execute();
      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('warning');
      expect(result[0].durationHours).toBeGreaterThanOrEqual(80);
    });
  });

  describe('resolved alerts are kept in history but removed from active list', () => {
    it('previously blocked issue no longer appears active but stays in history', async () => {
      const resolvedAlert = new BlockedIssueAlertBuilder()
        .withActive(false)
        .withResolvedAt(new Date().toISOString())
        .build();

      alertGateway.alerts = [resolvedAlert];

      detectionDataGateway.hasSyncData = true;
      detectionDataGateway.issuesWithCurrentStatus = [];

      await detectBlockedIssues.execute();

      const activeAlerts = await getBlockedIssues.execute();
      expect(activeAlerts).toHaveLength(0);

      const history = await getAlertHistory.execute();
      expect(history.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('detection requires synchronized data', () => {
    it('rejects when no Linear data imported', async () => {
      detectionDataGateway.hasSyncData = false;

      await expect(detectBlockedIssues.execute()).rejects.toThrow(
        "Veuillez d'abord synchroniser vos données Linear.",
      );
    });
  });

  describe('invalid threshold is rejected', () => {
    it('rejects negative threshold', async () => {
      await expect(
        setStatusThreshold.execute({ statusName: 'In Progress', thresholdHours: -5 }),
      ).rejects.toThrow('Le seuil doit être une durée positive.');
    });
  });
});
