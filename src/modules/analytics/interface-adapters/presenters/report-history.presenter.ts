import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type SprintReport } from '../../entities/sprint-report/sprint-report.js';

export interface ReportHistoryItemDto {
  id: string;
  cycleName: string;
  language: string;
  generatedAt: string;
}

export interface ReportHistoryDto {
  reports: ReportHistoryItemDto[];
  emptyMessage: string | null;
}

@Injectable()
export class ReportHistoryPresenter
  implements Presenter<SprintReport[], ReportHistoryDto>
{
  present(reports: SprintReport[]): ReportHistoryDto {
    if (reports.length === 0) {
      return {
        reports: [],
        emptyMessage: "Aucun rapport n'a encore été généré pour cette équipe.",
      };
    }

    return {
      reports: reports.map((report) => ({
        id: report.id,
        cycleName: report.cycleName,
        language: report.language,
        generatedAt: report.generatedAt,
      })),
      emptyMessage: null,
    };
  }
}
