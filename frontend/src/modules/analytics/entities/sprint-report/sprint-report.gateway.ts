import {
  type SprintReportDetailResponse,
  type SprintReportHistoryResponse,
} from './sprint-report.response.ts';

export interface ListSprintReportsParams {
  teamId: string;
}

export interface GetSprintReportDetailParams {
  reportId: string;
}

export interface GenerateSprintReportParams {
  cycleId: string;
  teamId: string;
}

export abstract class SprintReportGateway {
  abstract listForTeam(
    params: ListSprintReportsParams,
  ): Promise<SprintReportHistoryResponse>;

  abstract getDetail(
    params: GetSprintReportDetailParams,
  ): Promise<SprintReportDetailResponse>;

  abstract generate(params: GenerateSprintReportParams): Promise<void>;
}
