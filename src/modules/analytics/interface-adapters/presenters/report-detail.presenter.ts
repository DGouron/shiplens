import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type SprintReport } from '../../entities/sprint-report/sprint-report.js';

export interface ReportDetailDto {
  id: string;
  cycleName: string;
  language: string;
  generatedAt: string;
  markdown: string;
  plainText: string;
}

const NO_TREND_MESSAGE: Record<string, string> = {
  FR: "Pas d'historique disponible pour comparer la vélocité",
  EN: 'No historical data available to compare velocity',
};

const SECTION_LABELS: Record<string, Record<string, string>> = {
  FR: {
    summary: 'Résumé',
    trends: 'Tendances',
    highlights: 'Points forts',
    risks: 'Risques',
    recommendations: 'Recommandations',
  },
  EN: {
    summary: 'Summary',
    trends: 'Trends',
    highlights: 'Highlights',
    risks: 'Risks',
    recommendations: 'Recommendations',
  },
};

@Injectable()
export class ReportDetailPresenter
  implements Presenter<SprintReport, ReportDetailDto>
{
  present(report: SprintReport): ReportDetailDto {
    const labels = SECTION_LABELS[report.language] ?? SECTION_LABELS['EN'];
    const trendsContent =
      report.trends ?? NO_TREND_MESSAGE[report.language] ?? NO_TREND_MESSAGE['EN'];

    const markdown = [
      `# ${report.cycleName}`,
      '',
      `## ${labels.summary}`,
      report.executiveSummary,
      '',
      `## ${labels.trends}`,
      trendsContent,
      '',
      `## ${labels.highlights}`,
      report.highlights,
      '',
      `## ${labels.risks}`,
      report.risks,
      '',
      `## ${labels.recommendations}`,
      report.recommendations,
    ].join('\n');

    const plainText = [
      report.cycleName,
      '',
      `${labels.summary}:`,
      report.executiveSummary,
      '',
      `${labels.trends}:`,
      trendsContent,
      '',
      `${labels.highlights}:`,
      report.highlights,
      '',
      `${labels.risks}:`,
      report.risks,
      '',
      `${labels.recommendations}:`,
      report.recommendations,
    ].join('\n');

    return {
      id: report.id,
      cycleName: report.cycleName,
      language: report.language,
      generatedAt: report.generatedAt,
      markdown,
      plainText,
    };
  }
}
