import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type SprintReport } from '../../entities/sprint-report/sprint-report.js';
import { type AuditSection } from '../../entities/sprint-report/sprint-report.schema.js';

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
  FR: "Pas d'historique disponible pour comparer la vélocité",
  EN: 'No historical data available to compare velocity',
};

@Injectable()
export class SprintReportPresenter
  implements Presenter<SprintReport, SprintReportDto>
{
  present(report: SprintReport): SprintReportDto {
    return {
      cycleName: report.cycleName,
      language: report.language,
      executiveSummary: report.executiveSummary,
      trends: report.trends ?? NO_TREND_MESSAGE[report.language] ?? NO_TREND_MESSAGE['EN'],
      highlights: report.highlights,
      risks: report.risks,
      recommendations: report.recommendations,
      auditSection: report.auditSection,
    };
  }
}
