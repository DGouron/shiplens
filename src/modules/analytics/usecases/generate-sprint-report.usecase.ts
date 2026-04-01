import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { SprintReportDataGateway, type SprintContext, type TrendContext } from '../entities/sprint-report/sprint-report-data.gateway.js';
import { AiTextGeneratorGateway, type AiProvider } from '../entities/sprint-report/ai-text-generator.gateway.js';
import { SprintReportGateway } from '../entities/sprint-report/sprint-report.gateway.js';
import { SprintReport } from '../entities/sprint-report/sprint-report.js';
import { type AuditSection } from '../entities/sprint-report/sprint-report.schema.js';
import { SprintNotSynchronizedError } from '../entities/sprint-report/sprint-report.errors.js';
import { EmptySprintError } from '../entities/sprint-report/sprint-report.errors.js';
import { UnsupportedLanguageError } from '../entities/sprint-report/sprint-report.errors.js';
import { AuditRuleGateway } from '../../audit/entities/audit-rule/audit-rule.gateway.js';
import { type AuditRule, type EvaluationResult } from '../../audit/entities/audit-rule/audit-rule.js';
import { type CycleMetrics } from '../../audit/entities/audit-rule/cycle-metrics.js';
import { ChecklistItemGateway } from '../../audit/entities/checklist-item/checklist-item.gateway.js';
import { CycleMetricsDataGateway } from '../entities/cycle-snapshot/cycle-metrics-data.gateway.js';
import { CycleSnapshot } from '../entities/cycle-snapshot/cycle-snapshot.js';

interface GenerateSprintReportParams {
  cycleId: string;
  teamId: string;
  language: string;
  provider: AiProvider;
}

interface RuleEvaluation {
  identifier: string;
  ruleName: string;
  result: EvaluationResult;
}

const SUPPORTED_LANGUAGES = ['FR', 'EN'];
const MINIMUM_TREND_CYCLES = 3;

@Injectable()
export class GenerateSprintReportUsecase
  implements Usecase<GenerateSprintReportParams, SprintReport>
{
  constructor(
    private readonly sprintReportDataGateway: SprintReportDataGateway,
    private readonly aiTextGeneratorGateway: AiTextGeneratorGateway,
    private readonly sprintReportGateway: SprintReportGateway,
    private readonly auditRuleGateway: AuditRuleGateway,
    private readonly checklistItemGateway: ChecklistItemGateway,
    private readonly cycleMetricsDataGateway: CycleMetricsDataGateway,
  ) {}

  async execute(params: GenerateSprintReportParams): Promise<SprintReport> {
    if (!SUPPORTED_LANGUAGES.includes(params.language)) {
      throw new UnsupportedLanguageError();
    }

    const isSynchronized = await this.sprintReportDataGateway.isSynchronized(
      params.teamId,
    );

    if (!isSynchronized) {
      throw new SprintNotSynchronizedError();
    }

    const sprintContext = await this.sprintReportDataGateway.getSprintContext(
      params.cycleId,
      params.teamId,
    );

    if (sprintContext.issues.length === 0) {
      throw new EmptySprintError();
    }

    const trendContext = await this.sprintReportDataGateway.getTrendContext(
      params.cycleId,
      params.teamId,
    );

    const auditRules = await this.auditRuleGateway.findAll();
    const hasAuditRules = auditRules.length > 0;

    let ruleEvaluations: RuleEvaluation[] = [];
    if (hasAuditRules) {
      ruleEvaluations = await this.evaluateAuditRules(auditRules, params.cycleId, params.teamId);
    }

    const prompt = this.buildPrompt(sprintContext, trendContext, params.language, ruleEvaluations);
    const generatedText = await this.aiTextGeneratorGateway.generate(
      prompt,
      params.provider,
    );

    const parsedSections = JSON.parse(generatedText) as Record<string, unknown>;

    let auditSection: AuditSection | null = null;
    if (hasAuditRules) {
      auditSection = await this.buildAuditSection(
        ruleEvaluations,
        parsedSections,
        params.teamId,
      );
    }

    const report = SprintReport.create({
      id: randomUUID(),
      cycleId: params.cycleId,
      teamId: params.teamId,
      cycleName: sprintContext.cycleName,
      language: params.language,
      generatedAt: new Date().toISOString(),
      sections: {
        executiveSummary: parsedSections.executiveSummary,
        trends: trendContext ? parsedSections.trends : null,
        highlights: parsedSections.highlights,
        risks: parsedSections.risks,
        recommendations: parsedSections.recommendations,
      },
      auditSection,
    });

    await this.sprintReportGateway.save(report);

    return report;
  }

  private async evaluateAuditRules(
    rules: AuditRule[],
    cycleId: string,
    teamId: string,
  ): Promise<RuleEvaluation[]> {
    const snapshotData = await this.cycleMetricsDataGateway.getSnapshotData(cycleId, teamId);
    const cycleMetrics = this.buildCycleMetrics(snapshotData);

    return rules.map((rule) => ({
      identifier: rule.identifier,
      ruleName: rule.name,
      result: rule.evaluate(cycleMetrics),
    }));
  }

  private buildCycleMetrics(snapshotData: { issues: readonly { statusName: string; points: number | null; createdAt: string; completedAt: string | null; startedAt: string | null }[]; startsAt: string }): CycleMetrics {
    const completedIssues = snapshotData.issues.filter(
      (issue) => issue.completedAt !== null,
    );

    const cycleStart = new Date(snapshotData.startsAt);
    const initialIssues = snapshotData.issues.filter(
      (issue) => new Date(issue.createdAt) <= cycleStart,
    );
    const addedIssues = snapshotData.issues.filter(
      (issue) => new Date(issue.createdAt) > cycleStart,
    );

    const millisecondsPerDay = 1000 * 60 * 60 * 24;

    const cycleTimesInDays: number[] = [];
    for (const issue of completedIssues) {
      if (issue.startedAt !== null && issue.completedAt !== null) {
        const start = new Date(issue.startedAt).getTime();
        const end = new Date(issue.completedAt).getTime();
        cycleTimesInDays.push((end - start) / millisecondsPerDay);
      }
    }

    const averageCycleTimeInDays = cycleTimesInDays.length > 0
      ? cycleTimesInDays.reduce((sum, time) => sum + time, 0) / cycleTimesInDays.length
      : 0;

    const leadTimesInDays: number[] = [];
    for (const issue of completedIssues) {
      if (issue.completedAt !== null) {
        const created = new Date(issue.createdAt).getTime();
        const completed = new Date(issue.completedAt).getTime();
        leadTimesInDays.push((completed - created) / millisecondsPerDay);
      }
    }

    const averageLeadTimeInDays = leadTimesInDays.length > 0
      ? leadTimesInDays.reduce((sum, time) => sum + time, 0) / leadTimesInDays.length
      : 0;

    const completedPoints = completedIssues.reduce(
      (sum, issue) => sum + (issue.points ?? 0),
      0,
    );

    const completedInitial = initialIssues.filter(
      (issue) => issue.completedAt !== null,
    ).length;

    const completionRate = initialIssues.length > 0
      ? Math.round((completedInitial / initialIssues.length) * 100)
      : 0;

    const statusDistribution: Record<string, number> = {};
    for (const issue of snapshotData.issues) {
      statusDistribution[issue.statusName] = (statusDistribution[issue.statusName] ?? 0) + 1;
    }

    return {
      averageCycleTimeInDays,
      averageLeadTimeInDays,
      throughput: completedIssues.length,
      completionRate,
      scopeCreep: addedIssues.length,
      velocity: completedPoints,
      labelDistribution: {},
      statusDistribution,
      metricRatios: {},
    };
  }

  private async buildAuditSection(
    evaluations: RuleEvaluation[],
    parsedSections: Record<string, unknown>,
    teamId: string,
  ): Promise<AuditSection> {
    const auditRecommendations = (parsedSections.auditRecommendations ?? {}) as Record<string, string>;

    const passCount = evaluations.filter(
      (evaluation) => evaluation.result.outcome === 'pass',
    ).length;
    const adherenceScore = Math.round((passCount / evaluations.length) * 100);

    const evaluatedRules = evaluations.map((evaluation) => ({
      ruleName: evaluation.ruleName,
      status: evaluation.result.outcome,
      measuredValue: evaluation.result.message,
      threshold: evaluation.result.message,
      recommendation: evaluation.result.outcome === 'fail'
        ? (auditRecommendations[evaluation.identifier] ?? null)
        : null,
    }));

    const checklistItems = await this.checklistItemGateway.findAll();

    const previousReports = await this.sprintReportGateway.findByTeamId(teamId);
    const reportsWithAuditSection = previousReports
      .filter((report) => report.auditSection !== null);

    const previousScores = reportsWithAuditSection
      .map((report) => {
        const section = report.auditSection;
        return section ? section.adherenceScore : 0;
      });

    const trend = previousScores.length >= MINIMUM_TREND_CYCLES
      ? {
          scores: previousScores.slice(0, MINIMUM_TREND_CYCLES),
          message: [...previousScores.slice(0, MINIMUM_TREND_CYCLES), adherenceScore]
            .map((score) => `${score}%`)
            .join(' → '),
        }
      : null;

    return {
      evaluatedRules,
      checklistItems: checklistItems.map((item) => ({ name: item.name })),
      adherenceScore,
      trend,
    };
  }

  private buildPrompt(
    sprintContext: SprintContext,
    trendContext: TrendContext | null,
    language: string,
    ruleEvaluations: RuleEvaluation[],
  ): string {
    const completedIssues = sprintContext.issues.filter(
      (issue) => issue.completedAt !== null,
    );
    const completedPoints = completedIssues.reduce(
      (sum, issue) => sum + (issue.points ?? 0),
      0,
    );
    const totalPoints = sprintContext.issues.reduce(
      (sum, issue) => sum + (issue.points ?? 0),
      0,
    );

    const languageInstruction = language === 'FR'
      ? 'Rédige le rapport en français.'
      : 'Write the report in English.';

    let trendSection = '';
    if (trendContext) {
      trendSection = `Previous velocities: ${trendContext.previousVelocities.join(', ')} points.`;
    } else {
      trendSection = 'No historical data available for trend analysis.';
    }

    const failedRules = ruleEvaluations.filter(
      (evaluation) => evaluation.result.outcome === 'fail',
    );

    let auditSection = '';
    if (failedRules.length > 0) {
      const failedDetails = failedRules
        .map((evaluation) => `- ${evaluation.identifier}: ${evaluation.ruleName} — ${evaluation.result.message}`)
        .join('\n');
      auditSection = [
        'Audit rules that failed:',
        failedDetails,
        'Include "auditRecommendations" in your JSON response with a recommendation for each failed rule identifier.',
        `Format: "auditRecommendations": { ${failedRules.map((evaluation) => `"${evaluation.identifier}": "recommendation"`).join(', ')} }`,
      ].join('\n');
    }

    return [
      `Generate a structured sprint report for "${sprintContext.cycleName}" (${sprintContext.cycleId}).`,
      `Period: ${sprintContext.startsAt} to ${sprintContext.endsAt}.`,
      `Total issues: ${sprintContext.issues.length}. Completed: ${completedIssues.length}.`,
      `Velocity: ${completedPoints}/${totalPoints} points.`,
      trendSection,
      `Issues: ${sprintContext.issues.map((issue) => `${issue.title} (${issue.statusName}, ${issue.points ?? 0}pts)`).join('; ')}.`,
      languageInstruction,
      'Respond as JSON: {"executiveSummary": "...", "trends": "...", "highlights": "...", "risks": "...", "recommendations": "..."}.',
      'The executiveSummary must be 3-5 sentences about overall sprint health.',
      'Recommendations must be concrete and actionable, not vague generalities.',
      trendContext ? '' : 'Set trends to null since no historical data is available.',
      auditSection,
    ].filter(Boolean).join('\n');
  }
}
