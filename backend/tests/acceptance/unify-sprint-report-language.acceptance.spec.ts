import { ReportDetailPresenter } from '@modules/analytics/interface-adapters/presenters/report-detail.presenter.js';
import { SprintReportPresenter } from '@modules/analytics/interface-adapters/presenters/sprint-report.presenter.js';
import { StubAiTextGeneratorGateway } from '@modules/analytics/testing/good-path/stub.ai-text-generator.gateway.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubCycleMetricsDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-metrics-data.gateway.js';
import { StubSprintReportGateway } from '@modules/analytics/testing/good-path/stub.sprint-report.gateway.js';
import { StubSprintReportDataGateway } from '@modules/analytics/testing/good-path/stub.sprint-report-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { GenerateSprintReportUsecase } from '@modules/analytics/usecases/generate-sprint-report.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { StubAuditRuleGateway } from '@modules/audit/testing/good-path/stub.audit-rule.gateway.js';
import { StubChecklistItemGateway } from '@modules/audit/testing/good-path/stub.checklist-item.gateway.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { SprintReportBuilder } from '../builders/sprint-report.builder.js';

describe('Unify Sprint Report Language (acceptance)', () => {
  let dataGateway: StubSprintReportDataGateway;
  let aiGateway: StubAiTextGeneratorGateway;
  let sprintReportGateway: StubSprintReportGateway;
  let auditRuleGateway: StubAuditRuleGateway;
  let checklistItemGateway: StubChecklistItemGateway;
  let cycleMetricsDataGateway: StubCycleMetricsDataGateway;
  let workspaceSettingsGateway: StubWorkspaceSettingsGateway;
  let usecase: GenerateSprintReportUsecase;
  let sprintReportPresenter: SprintReportPresenter;
  let reportDetailPresenter: ReportDetailPresenter;

  beforeEach(() => {
    dataGateway = new StubSprintReportDataGateway();
    aiGateway = new StubAiTextGeneratorGateway();
    sprintReportGateway = new StubSprintReportGateway();
    auditRuleGateway = new StubAuditRuleGateway();
    checklistItemGateway = new StubChecklistItemGateway();
    cycleMetricsDataGateway = new StubCycleMetricsDataGateway();
    workspaceSettingsGateway = new StubWorkspaceSettingsGateway();

    cycleMetricsDataGateway.snapshotData = {
      cycleId: 'cycle-1',
      teamId: 'team-1',
      cycleName: 'Sprint 10',
      startsAt: '2025-01-01T00:00:00Z',
      endsAt: '2025-01-14T00:00:00Z',
      issues: [
        {
          externalId: 'issue-1',
          title: 'Issue 1',
          statusName: 'Done',
          points: 3,
          createdAt: '2025-01-01T00:00:00Z',
          completedAt: '2025-01-10T00:00:00Z',
          startedAt: '2025-01-05T00:00:00Z',
        },
      ],
    };

    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      new StubWorkflowConfigGateway(),
      new StubAvailableStatusesGateway(),
    );

    usecase = new GenerateSprintReportUsecase(
      dataGateway,
      aiGateway,
      sprintReportGateway,
      auditRuleGateway,
      checklistItemGateway,
      cycleMetricsDataGateway,
      workspaceSettingsGateway,
      resolveWorkflowConfig,
    );
    sprintReportPresenter = new SprintReportPresenter();
    reportDetailPresenter = new ReportDetailPresenter();
  });

  describe('report generation uses workspace language', () => {
    it('generates report in english when workspace language is EN', async () => {
      workspaceSettingsGateway.storedLanguage = 'en';
      aiGateway.generatedText = JSON.stringify({
        executiveSummary: 'The sprint went well.',
        trends: null,
        highlights: 'Good progress on API.',
        risks: 'Two critical issues remain.',
        recommendations: 'Focus on critical bugs next sprint.',
      });

      const report = await usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        provider: 'OpenAI',
      });

      expect(report.language).toBe('EN');
    });

    it('generates report in french when workspace language is FR', async () => {
      workspaceSettingsGateway.storedLanguage = 'fr';

      const report = await usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        provider: 'OpenAI',
      });

      expect(report.language).toBe('FR');
    });

    it('does not require language in the request', async () => {
      workspaceSettingsGateway.storedLanguage = 'en';
      aiGateway.generatedText = JSON.stringify({
        executiveSummary: 'Sprint completed.',
        trends: null,
        highlights: 'Done.',
        risks: 'None.',
        recommendations: 'Keep going.',
      });

      const report = await usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        provider: 'OpenAI',
      });

      expect(report.language).toBe('EN');
    });
  });

  describe('display language follows workspace, not report stored language', () => {
    it('displays french report with english labels in english workspace', () => {
      const frenchReport = new SprintReportBuilder()
        .withLanguage('FR')
        .withCycleName('Sprint 12')
        .build();

      const result = reportDetailPresenter.present(frenchReport, 'en');

      expect(result.markdown).toContain('## Summary');
      expect(result.markdown).toContain('## Trends');
      expect(result.markdown).toContain('## Highlights');
      expect(result.markdown).toContain('## Risks');
      expect(result.markdown).toContain('## Recommendations');
      expect(result.markdown).toContain(frenchReport.executiveSummary);
    });

    it('displays english report with french labels in french workspace', () => {
      const englishReport = new SprintReportBuilder()
        .withLanguage('EN')
        .withCycleName('Sprint 12')
        .build();

      const result = reportDetailPresenter.present(englishReport, 'fr');

      expect(result.markdown).toContain('## Résumé');
      expect(result.markdown).toContain('## Tendances');
      expect(result.markdown).toContain('## Points forts');
      expect(result.markdown).toContain('## Risques');
      expect(result.markdown).toContain('## Recommandations');
      expect(result.markdown).toContain(englishReport.executiveSummary);
    });
  });

  describe('no trend message follows workspace language', () => {
    it('shows english no trend message in english workspace', () => {
      const report = new SprintReportBuilder().withTrends(null).build();

      const dto = sprintReportPresenter.present(report, 'en');

      expect(dto.trends).toBe(
        'No historical data available to compare velocity',
      );
    });

    it('shows french no trend message in french workspace', () => {
      const report = new SprintReportBuilder().withTrends(null).build();

      const dto = sprintReportPresenter.present(report, 'fr');

      expect(dto.trends).toBe(
        "Pas d'historique disponible pour comparer la vélocité",
      );
    });
  });

  describe('export report labels follow workspace language', () => {
    it('uses english markdown headers in english workspace', () => {
      const report = new SprintReportBuilder().build();

      const result = reportDetailPresenter.present(report, 'en');

      expect(result.markdown).toContain('## Summary');
      expect(result.markdown).toContain('## Trends');
      expect(result.markdown).toContain('## Highlights');
      expect(result.markdown).toContain('## Risks');
      expect(result.markdown).toContain('## Recommendations');
    });

    it('uses french markdown headers in french workspace', () => {
      const report = new SprintReportBuilder().build();

      const result = reportDetailPresenter.present(report, 'fr');

      expect(result.markdown).toContain('## Résumé');
      expect(result.markdown).toContain('## Tendances');
      expect(result.markdown).toContain('## Points forts');
      expect(result.markdown).toContain('## Risques');
      expect(result.markdown).toContain('## Recommandations');
    });
  });

  describe('audit section labels follow workspace language', () => {
    it('uses english audit labels in english workspace', () => {
      const report = new SprintReportBuilder()
        .withAuditSection({
          evaluatedRules: [
            {
              ruleName: 'Cycle time max',
              status: 'pass',
              measuredValue: 'Average cycle time: 3 days',
              threshold: 'Average cycle time: 3 days',
              recommendation: null,
            },
          ],
          checklistItems: [],
          adherenceScore: 100,
          trend: {
            scores: [60, 70, 80],
            message: '60% -> 70% -> 80% -> 100%',
          },
        })
        .build();

      const result = reportDetailPresenter.present(report, 'en');

      expect(result.markdown).toContain('## Practice audit');
      expect(result.markdown).toContain('Adherence score');
      expect(result.markdown).toContain('Trend');
    });

    it('uses french audit labels in french workspace', () => {
      const report = new SprintReportBuilder()
        .withAuditSection({
          evaluatedRules: [
            {
              ruleName: 'Cycle time max',
              status: 'pass',
              measuredValue: 'Cycle time moyen : 3 jours',
              threshold: 'Cycle time moyen : 3 jours',
              recommendation: null,
            },
          ],
          checklistItems: [],
          adherenceScore: 100,
          trend: {
            scores: [60, 70, 80],
            message: '60% -> 70% -> 80% -> 100%',
          },
        })
        .build();

      const result = reportDetailPresenter.present(report, 'fr');

      expect(result.markdown).toContain('## Audit des pratiques');
      expect(result.markdown).toContain("Score d'adhérence");
      expect(result.markdown).toContain('Tendance');
    });
  });
});
