import {
  type GenerateSprintReportParams,
  type GetSprintReportDetailParams,
  type ListSprintReportsParams,
  SprintReportGateway,
} from '../../entities/sprint-report/sprint-report.gateway.ts';
import {
  type SprintReportDetailResponse,
  type SprintReportHistoryResponse,
} from '../../entities/sprint-report/sprint-report.response.ts';

interface StubSprintReportGatewayOptions {
  details?: SprintReportDetailResponse[];
  teamIdToReportIds?: Record<string, string[]>;
  onGenerate?: (
    params: GenerateSprintReportParams,
  ) => SprintReportDetailResponse;
}

export class StubSprintReportGateway extends SprintReportGateway {
  private readonly details: SprintReportDetailResponse[];
  private readonly teamIdToReportIds: Record<string, string[]>;
  private readonly onGenerate?: (
    params: GenerateSprintReportParams,
  ) => SprintReportDetailResponse;

  listCalls: ListSprintReportsParams[] = [];
  detailCalls: GetSprintReportDetailParams[] = [];
  generateCalls: GenerateSprintReportParams[] = [];

  constructor(options: StubSprintReportGatewayOptions = {}) {
    super();
    this.details = options.details ?? [];
    this.teamIdToReportIds = { ...(options.teamIdToReportIds ?? {}) };
    this.onGenerate = options.onGenerate;
  }

  async listForTeam(
    params: ListSprintReportsParams,
  ): Promise<SprintReportHistoryResponse> {
    this.listCalls.push(params);
    const reportIds = this.teamIdToReportIds[params.teamId] ?? [];
    const reports = reportIds
      .map((id) => this.details.find((detail) => detail.id === id))
      .filter(
        (detail): detail is SprintReportDetailResponse => detail !== undefined,
      )
      .map((detail) => ({
        id: detail.id,
        cycleName: detail.cycleName,
        language: detail.language,
        generatedAt: detail.generatedAt,
      }));
    return { reports };
  }

  async getDetail(
    params: GetSprintReportDetailParams,
  ): Promise<SprintReportDetailResponse> {
    this.detailCalls.push(params);
    const detail = this.details.find((item) => item.id === params.reportId);
    if (detail === undefined) {
      throw new Error(
        `StubSprintReportGateway: no detail registered for id ${params.reportId}`,
      );
    }
    return { ...detail };
  }

  async generate(params: GenerateSprintReportParams): Promise<void> {
    this.generateCalls.push(params);
    const synthesized =
      this.onGenerate?.(params) ??
      ({
        id: `report-${this.details.length + 1}`,
        cycleName: `Cycle ${params.cycleId}`,
        language: 'EN',
        generatedAt: '2026-04-15T10:00:00.000Z',
        markdown: '# Sprint Report\n\nGenerated.',
        plainText: 'Sprint Report\nGenerated.',
      } satisfies SprintReportDetailResponse);
    this.details.push(synthesized);
    const existing = this.teamIdToReportIds[params.teamId] ?? [];
    this.teamIdToReportIds[params.teamId] = [...existing, synthesized.id];
  }
}
