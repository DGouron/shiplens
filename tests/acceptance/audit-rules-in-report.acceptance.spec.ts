import { StubAiTextGeneratorGateway } from '@modules/analytics/testing/good-path/stub.ai-text-generator.gateway.js';
import { StubCycleMetricsDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-metrics-data.gateway.js';
import { StubSprintReportGateway } from '@modules/analytics/testing/good-path/stub.sprint-report.gateway.js';
import { StubSprintReportDataGateway } from '@modules/analytics/testing/good-path/stub.sprint-report-data.gateway.js';
import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { GenerateSprintReportUsecase } from '@modules/analytics/usecases/generate-sprint-report.usecase.js';
import { StubAuditRuleGateway } from '@modules/audit/testing/good-path/stub.audit-rule.gateway.js';
import { StubChecklistItemGateway } from '@modules/audit/testing/good-path/stub.checklist-item.gateway.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuditRuleBuilder } from '../builders/audit-rule.builder.js';
import { ChecklistItemBuilder } from '../builders/checklist-item.builder.js';

describe('Audit Rules in Report (acceptance)', () => {
  let dataGateway: StubSprintReportDataGateway;
  let aiGateway: StubAiTextGeneratorGateway;
  let sprintReportGateway: StubSprintReportGateway;
  let auditRuleGateway: StubAuditRuleGateway;
  let checklistItemGateway: StubChecklistItemGateway;
  let cycleMetricsDataGateway: StubCycleMetricsDataGateway;
  let workspaceSettingsGateway: StubWorkspaceSettingsGateway;
  let usecase: GenerateSprintReportUsecase;

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

    aiGateway.generatedText = JSON.stringify({
      executiveSummary: "Le sprint s'est bien deroulé.",
      trends: 'La velocite est en hausse.',
      highlights: 'Bonne progression.',
      risks: 'Aucun risque majeur.',
      recommendations: 'Continuer.',
      auditRecommendations: {
        'CT-FAIL': 'Reduire le cycle time en decoupant les taches.',
      },
    });

    usecase = new GenerateSprintReportUsecase(
      dataGateway,
      aiGateway,
      sprintReportGateway,
      auditRuleGateway,
      checklistItemGateway,
      cycleMetricsDataGateway,
      workspaceSettingsGateway,
    );
  });

  describe('the report contains a dedicated audit section', () => {
    it('nominal: 10 rules evaluated with 8 pass, 1 warn, 1 fail produces score 80%', async () => {
      for (let index = 1; index <= 8; index++) {
        await auditRuleGateway.save(
          new AuditRuleBuilder()
            .withIdentifier(`PASS-${index}`)
            .withName(`Rule pass ${index}`)
            .withSeverity('error')
            .withConditionExpression('cycle time > 100 jours')
            .build(),
        );
      }

      await auditRuleGateway.save(
        new AuditRuleBuilder()
          .withIdentifier('WARN-1')
          .withName('Rule warn')
          .withSeverity('warning')
          .withConditionExpression('cycle time > 3 jours')
          .build(),
      );

      await auditRuleGateway.save(
        new AuditRuleBuilder()
          .withIdentifier('FAIL-1')
          .withName('Rule fail')
          .withSeverity('error')
          .withConditionExpression('cycle time > 3 jours')
          .build(),
      );

      const report = await usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        provider: 'OpenAI',
      });

      expect(report.auditSection).not.toBeNull();
      expect(report.auditSection?.adherenceScore).toBe(80);
      expect(report.auditSection?.evaluatedRules).toHaveLength(10);
    });

    it('all pass: 5 rules all pass produces score 100% with no recommendations', async () => {
      for (let index = 1; index <= 5; index++) {
        await auditRuleGateway.save(
          new AuditRuleBuilder()
            .withIdentifier(`PASS-${index}`)
            .withName(`Rule pass ${index}`)
            .withSeverity('error')
            .withConditionExpression('cycle time > 100 jours')
            .build(),
        );
      }

      const report = await usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        provider: 'OpenAI',
      });

      expect(report.auditSection?.adherenceScore).toBe(100);
      const recommendations = report.auditSection?.evaluatedRules.filter(
        (rule) => rule.recommendation !== null,
      );
      expect(recommendations).toHaveLength(0);
    });

    it('all fail: 5 rules all fail produces score 0% with recommendations', async () => {
      for (let index = 1; index <= 5; index++) {
        await auditRuleGateway.save(
          new AuditRuleBuilder()
            .withIdentifier(`FAIL-${index}`)
            .withName(`Rule fail ${index}`)
            .withSeverity('error')
            .withConditionExpression('cycle time > 3 jours')
            .build(),
        );
      }

      aiGateway.generatedText = JSON.stringify({
        executiveSummary: 'Sprint ok.',
        trends: null,
        highlights: 'Rien.',
        risks: 'Rien.',
        recommendations: 'Rien.',
        auditRecommendations: {
          'FAIL-1': 'Recommandation 1.',
          'FAIL-2': 'Recommandation 2.',
          'FAIL-3': 'Recommandation 3.',
          'FAIL-4': 'Recommandation 4.',
          'FAIL-5': 'Recommandation 5.',
        },
      });

      const report = await usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        provider: 'OpenAI',
      });

      expect(report.auditSection?.adherenceScore).toBe(0);
      const recommendations = report.auditSection?.evaluatedRules.filter(
        (rule) => rule.recommendation !== null,
      );
      expect(recommendations).toHaveLength(5);
    });

    it('no rules defined: audit section is null', async () => {
      const report = await usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        provider: 'OpenAI',
      });

      expect(report.auditSection).toBeNull();
    });
  });

  describe('trend compares adherence score over last 3 completed cycles', () => {
    it('trend displayed with 3+ previous cycles', async () => {
      await auditRuleGateway.save(
        new AuditRuleBuilder()
          .withIdentifier('PASS-1')
          .withSeverity('error')
          .withConditionExpression('cycle time > 100 jours')
          .build(),
      );

      for (const score of [60, 70, 75]) {
        const previousReport = (
          await import(
            '@modules/analytics/entities/sprint-report/sprint-report.js'
          )
        ).SprintReport.create({
          id: crypto.randomUUID(),
          cycleId: `prev-cycle-${score}`,
          teamId: 'team-1',
          cycleName: `Sprint ${score}`,
          language: 'FR',
          generatedAt: '2025-01-01T00:00:00Z',
          sections: {
            executiveSummary: 'Summary.',
            trends: null,
            highlights: 'Highlights.',
            risks: 'Risks.',
            recommendations: 'Recs.',
          },
          auditSection: {
            evaluatedRules: [],
            checklistItems: [],
            adherenceScore: score,
            trend: null,
          },
        });
        await sprintReportGateway.save(previousReport);
      }

      const report = await usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        provider: 'OpenAI',
      });

      expect(report.auditSection?.trend).not.toBeNull();
      expect(report.auditSection?.trend?.scores).toEqual([60, 70, 75]);
    });

    it('trend not displayed with less than 3 previous cycles', async () => {
      await auditRuleGateway.save(
        new AuditRuleBuilder()
          .withIdentifier('PASS-1')
          .withSeverity('error')
          .withConditionExpression('cycle time > 100 jours')
          .build(),
      );

      const report = await usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        provider: 'OpenAI',
      });

      expect(report.auditSection?.trend).toBeNull();
    });
  });

  describe('checklist items listed separately without automatic status', () => {
    it('checklist items present in audit section', async () => {
      await auditRuleGateway.save(
        new AuditRuleBuilder()
          .withIdentifier('PASS-1')
          .withSeverity('error')
          .withConditionExpression('cycle time > 100 jours')
          .build(),
      );

      await checklistItemGateway.save(
        new ChecklistItemBuilder()
          .withIdentifier('PM-COMMIT')
          .withName('Ecrire des messages de commit clairs')
          .build(),
      );

      await checklistItemGateway.save(
        new ChecklistItemBuilder()
          .withIdentifier('PM-REVIEW')
          .withName('Faire des code reviews')
          .build(),
      );

      const report = await usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        provider: 'OpenAI',
      });

      expect(report.auditSection?.checklistItems).toHaveLength(2);
      expect(report.auditSection?.checklistItems[0].name).toBe(
        'Ecrire des messages de commit clairs',
      );
      expect(report.auditSection?.checklistItems[1].name).toBe(
        'Faire des code reviews',
      );
    });
  });
});
