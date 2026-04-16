import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type SprintReport } from '../../entities/sprint-report/sprint-report.js';

export interface ReportHistoryItemDto {
  id: string;
  cycleId: string;
  cycleName: string;
  language: string;
  generatedAt: string;
}

export interface ReportHistoryDto {
  reports: ReportHistoryItemDto[];
}

@Injectable()
export class ReportHistoryPresenter
  implements Presenter<SprintReport[], ReportHistoryDto>
{
  present(reports: SprintReport[]): ReportHistoryDto {
    return {
      reports: reports.map((report) => ({
        id: report.id,
        cycleId: report.cycleId,
        cycleName: report.cycleName,
        language: report.language,
        generatedAt: report.generatedAt,
      })),
    };
  }
}
