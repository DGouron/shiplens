import { GatewayError } from '@/shared/foundation/gateway-error.ts';
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
import { sprintReportPaths } from '../url-contracts/sprint-report.url-contract.ts';
import {
  sprintReportDetailResponseGuard,
  sprintReportHistoryResponseGuard,
} from './sprint-report.response.guard.ts';

const HARDCODED_AI_PROVIDER = 'Anthropic';

export class SprintReportInHttpGateway extends SprintReportGateway {
  async listForTeam(
    params: ListSprintReportsParams,
  ): Promise<SprintReportHistoryResponse> {
    const response = await fetch(sprintReportPaths.listForTeam(params.teamId));
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch sprint reports: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = sprintReportHistoryResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid sprint report history payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }

  async getDetail(
    params: GetSprintReportDetailParams,
  ): Promise<SprintReportDetailResponse> {
    const response = await fetch(sprintReportPaths.detail(params.reportId));
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch sprint report detail: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = sprintReportDetailResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid sprint report detail payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }

  async generate(params: GenerateSprintReportParams): Promise<void> {
    const response = await fetch(sprintReportPaths.generate(params.cycleId), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamId: params.teamId,
        provider: HARDCODED_AI_PROVIDER,
      }),
    });
    if (!response.ok) {
      throw new GatewayError(
        `Failed to generate sprint report: HTTP ${response.status}`,
      );
    }
  }
}
