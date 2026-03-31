import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { SprintReportDataGateway, type SprintContext, type TrendContext } from '../entities/sprint-report/sprint-report-data.gateway.js';
import { AiTextGeneratorGateway, type AiProvider } from '../entities/sprint-report/ai-text-generator.gateway.js';
import { SprintReport } from '../entities/sprint-report/sprint-report.js';
import { SprintNotSynchronizedError } from '../entities/sprint-report/sprint-report.errors.js';
import { EmptySprintError } from '../entities/sprint-report/sprint-report.errors.js';
import { UnsupportedLanguageError } from '../entities/sprint-report/sprint-report.errors.js';

interface GenerateSprintReportParams {
  cycleId: string;
  teamId: string;
  language: string;
  provider: AiProvider;
}

const SUPPORTED_LANGUAGES = ['FR', 'EN'];

@Injectable()
export class GenerateSprintReportUsecase
  implements Usecase<GenerateSprintReportParams, SprintReport>
{
  constructor(
    private readonly sprintReportDataGateway: SprintReportDataGateway,
    private readonly aiTextGeneratorGateway: AiTextGeneratorGateway,
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

    const prompt = this.buildPrompt(sprintContext, trendContext, params.language);
    const generatedText = await this.aiTextGeneratorGateway.generate(
      prompt,
      params.provider,
    );

    const parsedSections = JSON.parse(generatedText) as Record<string, string | null>;

    return SprintReport.create({
      cycleId: params.cycleId,
      teamId: params.teamId,
      cycleName: sprintContext.cycleName,
      language: params.language,
      sections: {
        executiveSummary: parsedSections.executiveSummary,
        trends: trendContext ? parsedSections.trends : null,
        highlights: parsedSections.highlights,
        risks: parsedSections.risks,
        recommendations: parsedSections.recommendations,
      },
    });
  }

  private buildPrompt(
    sprintContext: SprintContext,
    trendContext: TrendContext | null,
    language: string,
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
    ].filter(Boolean).join('\n');
  }
}
