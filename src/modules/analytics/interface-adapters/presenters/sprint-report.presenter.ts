import { Injectable } from '@nestjs/common';
import { type SprintReport } from '../../entities/sprint-report/sprint-report.js';
import { type AuditSection } from '../../entities/sprint-report/sprint-report.schema.js';
import { type Locale } from '../../entities/workspace-settings/workspace-language.schema.js';

export interface SprintReportDto {
  cycleName: string;
  language: string;
  executiveSummary: string;
  trends: string;
  highlights: string;
  risks: string;
  recommendations: string;
  auditSection: AuditSection | null;
}

const NO_TREND_MESSAGE: Record<string, string> = {
  fr: "Pas d'historique disponible pour comparer la vélocité",
  en: 'No historical data available to compare velocity',
};

@Injectable()
export class SprintReportPresenter {
  present(report: SprintReport, locale: Locale): SprintReportDto {
    return {
      cycleName: report.cycleName,
      language: report.language,
      executiveSummary: report.executiveSummary,
      trends: report.trends ?? NO_TREND_MESSAGE[locale] ?? NO_TREND_MESSAGE.en,
      highlights: report.highlights,
      risks: report.risks,
      recommendations: report.recommendations,
      auditSection: report.auditSection,
    };
  }
}
