import {
  AiProviderUnavailableError,
  EmptySprintError,
  SprintNotSynchronizedError,
  UnsupportedLanguageError,
} from '@modules/analytics/entities/sprint-report/sprint-report.errors.js';
import { FailingAiTextGeneratorGateway } from '@modules/analytics/testing/bad-path/failing.ai-text-generator.gateway.js';
import { StubAiTextGeneratorGateway } from '@modules/analytics/testing/good-path/stub.ai-text-generator.gateway.js';
import { StubCycleMetricsDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-metrics-data.gateway.js';
import { StubSprintReportGateway } from '@modules/analytics/testing/good-path/stub.sprint-report.gateway.js';
import { StubSprintReportDataGateway } from '@modules/analytics/testing/good-path/stub.sprint-report-data.gateway.js';
import { GenerateSprintReportUsecase } from '@modules/analytics/usecases/generate-sprint-report.usecase.js';
import { StubAuditRuleGateway } from '@modules/audit/testing/good-path/stub.audit-rule.gateway.js';
import { StubChecklistItemGateway } from '@modules/audit/testing/good-path/stub.checklist-item.gateway.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuditRuleBuilder } from '../../../builders/audit-rule.builder.js';
import { ChecklistItemBuilder } from '../../../builders/checklist-item.builder.js';
import { SprintReportBuilder } from '../../../builders/sprint-report.builder.js';

describe('GenerateSprintReportUsecase', () => {
  let dataGateway: StubSprintReportDataGateway;
  let aiGateway: StubAiTextGeneratorGateway;
  let sprintReportGateway: StubSprintReportGateway;
  let auditRuleGateway: StubAuditRuleGateway;
  let checklistItemGateway: StubChecklistItemGateway;
  let cycleMetricsDataGateway: StubCycleMetricsDataGateway;
  let usecase: GenerateSprintReportUsecase;

  beforeEach(() => {
    dataGateway = new StubSprintReportDataGateway();
    aiGateway = new StubAiTextGeneratorGateway();
    sprintReportGateway = new StubSprintReportGateway();
    auditRuleGateway = new StubAuditRuleGateway();
    checklistItemGateway = new StubChecklistItemGateway();
    cycleMetricsDataGateway = new StubCycleMetricsDataGateway();

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

    usecase = new GenerateSprintReportUsecase(
      dataGateway,
      aiGateway,
      sprintReportGateway,
      auditRuleGateway,
      checklistItemGateway,
      cycleMetricsDataGateway,
    );
  });

  it('generates a report in french for a synchronized sprint', async () => {
    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(report.cycleId).toBe('cycle-1');
    expect(report.language).toBe('FR');
    expect(report.executiveSummary).toBeTruthy();
    expect(report.highlights).toBeTruthy();
    expect(report.risks).toBeTruthy();
    expect(report.recommendations).toBeTruthy();
  });

  it('generates a report in english', async () => {
    aiGateway.generatedText = JSON.stringify({
      executiveSummary: 'The sprint went well with stable velocity.',
      trends: 'Velocity increased by 10% compared to last 3 sprints.',
      highlights: 'Database migration completed ahead of schedule.',
      risks: 'Two critical issues remain open.',
      recommendations: 'Prioritize critical issue resolution next sprint.',
    });

    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'EN',
      provider: 'Anthropic',
    });

    expect(report.language).toBe('EN');
    expect(aiGateway.receivedProvider).toBe('Anthropic');
  });

  it('passes the correct provider to the AI gateway', async () => {
    await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'Ollama',
    });

    expect(aiGateway.receivedProvider).toBe('Ollama');
  });

  it('throws SprintNotSynchronizedError when sprint is not synchronized', async () => {
    dataGateway.synchronized = false;

    await expect(
      usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'FR',
        provider: 'OpenAI',
      }),
    ).rejects.toThrow(SprintNotSynchronizedError);
  });

  it('throws EmptySprintError when sprint has no issues', async () => {
    dataGateway.sprintContext = {
      ...dataGateway.sprintContext,
      issues: [],
    };

    await expect(
      usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'FR',
        provider: 'OpenAI',
      }),
    ).rejects.toThrow(EmptySprintError);
  });

  it('throws UnsupportedLanguageError for unsupported language', async () => {
    await expect(
      usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'JP' as 'FR',
        provider: 'OpenAI',
      }),
    ).rejects.toThrow(UnsupportedLanguageError);
  });

  it('throws AiProviderUnavailableError when provider is unavailable', async () => {
    const failingAiGateway = new FailingAiTextGeneratorGateway();
    const usecaseWithFailing = new GenerateSprintReportUsecase(
      dataGateway,
      failingAiGateway,
      sprintReportGateway,
      auditRuleGateway,
      checklistItemGateway,
      cycleMetricsDataGateway,
    );

    await expect(
      usecaseWithFailing.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'FR',
        provider: 'OpenAI',
      }),
    ).rejects.toThrow(AiProviderUnavailableError);
  });

  it('generates report without trends when no history is available', async () => {
    dataGateway.trendContext = null;

    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(report.trends).toBeNull();
  });

  it('includes trends when history is available', async () => {
    dataGateway.trendContext = { previousVelocities: [18, 20, 22] };

    aiGateway.generatedText = JSON.stringify({
      executiveSummary: "Le sprint s'est bien déroulé.",
      trends: 'La vélocité est en hausse.',
      highlights: 'Bonne progression.',
      risks: 'Aucun risque majeur.',
      recommendations: 'Continuer sur cette lancée.',
    });

    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(report.trends).toBeTruthy();
  });

  it('persists the generated report', async () => {
    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    const savedReports = await sprintReportGateway.findByTeamId('team-1');
    expect(savedReports).toHaveLength(1);
    expect(savedReports[0].id).toBe(report.id);
  });

  it('generates report with id and generatedAt', async () => {
    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(report.id).toBeTruthy();
    expect(report.generatedAt).toBeTruthy();
  });

  it('includes sprint context in the prompt sent to AI', async () => {
    await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(aiGateway.receivedPrompt).toContain('Sprint 10');
    expect(aiGateway.receivedPrompt).toContain('cycle-1');
  });

  it('returns null audit section when no audit rules are defined', async () => {
    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(report.auditSection).toBeNull();
  });

  it('evaluates audit rules and computes adherence score', async () => {
    await auditRuleGateway.save(
      new AuditRuleBuilder()
        .withIdentifier('PASS-1')
        .withSeverity('error')
        .withConditionExpression('cycle time > 100 jours')
        .build(),
    );
    await auditRuleGateway.save(
      new AuditRuleBuilder()
        .withIdentifier('FAIL-1')
        .withSeverity('error')
        .withConditionExpression('cycle time > 3 jours')
        .build(),
    );

    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(report.auditSection).not.toBeNull();
    expect(report.auditSection?.evaluatedRules).toHaveLength(2);
    expect(report.auditSection?.adherenceScore).toBe(50);
  });

  it('includes AI recommendations for failed rules', async () => {
    await auditRuleGateway.save(
      new AuditRuleBuilder()
        .withIdentifier('FAIL-1')
        .withName('Cycle time limit')
        .withSeverity('error')
        .withConditionExpression('cycle time > 3 jours')
        .build(),
    );

    aiGateway.generatedText = JSON.stringify({
      executiveSummary: 'Sprint ok.',
      trends: null,
      highlights: 'Rien.',
      risks: 'Rien.',
      recommendations: 'Rien.',
      auditRecommendations: {
        'FAIL-1': 'Reduire le cycle time.',
      },
    });

    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    const failedRule = report.auditSection?.evaluatedRules.find(
      (rule) => rule.status === 'fail',
    );
    expect(failedRule?.recommendation).toBe('Reduire le cycle time.');
  });

  it('includes checklist items in audit section', async () => {
    await auditRuleGateway.save(
      new AuditRuleBuilder()
        .withIdentifier('PASS-1')
        .withSeverity('error')
        .withConditionExpression('cycle time > 100 jours')
        .build(),
    );

    await checklistItemGateway.save(
      new ChecklistItemBuilder()
        .withIdentifier('CL-1')
        .withName('Code review')
        .build(),
    );

    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(report.auditSection?.checklistItems).toHaveLength(1);
    expect(report.auditSection?.checklistItems[0].name).toBe('Code review');
  });

  it('computes trend from previous reports with audit sections', async () => {
    await auditRuleGateway.save(
      new AuditRuleBuilder()
        .withIdentifier('PASS-1')
        .withSeverity('error')
        .withConditionExpression('cycle time > 100 jours')
        .build(),
    );

    for (const score of [60, 70, 75]) {
      const previousReport = new SprintReportBuilder()
        .withId(crypto.randomUUID())
        .withCycleId(`prev-cycle-${score}`)
        .withAuditSection({
          evaluatedRules: [],
          checklistItems: [],
          adherenceScore: score,
          trend: null,
        })
        .build();
      await sprintReportGateway.save(previousReport);
    }

    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(report.auditSection?.trend).not.toBeNull();
    expect(report.auditSection?.trend?.scores).toEqual([60, 70, 75]);
  });

  it('returns null trend when less than 3 previous reports have audit sections', async () => {
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
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(report.auditSection?.trend).toBeNull();
  });

  it('includes audit context in AI prompt when rules have failures', async () => {
    await auditRuleGateway.save(
      new AuditRuleBuilder()
        .withIdentifier('FAIL-1')
        .withName('Cycle time limit')
        .withSeverity('error')
        .withConditionExpression('cycle time > 3 jours')
        .build(),
    );

    await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(aiGateway.receivedPrompt).toContain('FAIL-1');
    expect(aiGateway.receivedPrompt).toContain('auditRecommendations');
  });
});
