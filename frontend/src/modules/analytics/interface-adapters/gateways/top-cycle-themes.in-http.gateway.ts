import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TopCycleThemesGateway } from '../../entities/top-cycle-themes/top-cycle-themes.gateway.ts';
import {
  type CycleThemeIssuesResponse,
  type TopCycleThemesResponse,
} from '../../entities/top-cycle-themes/top-cycle-themes.response.ts';
import { topCycleThemesPaths } from '../url-contracts/top-cycle-themes.url-contract.ts';
import {
  cycleThemeIssuesResponseGuard,
  topCycleThemesResponseGuard,
} from './top-cycle-themes.response.guard.ts';

export class TopCycleThemesInHttpGateway extends TopCycleThemesGateway {
  async fetchTopCycleThemes(params: {
    teamId: string;
    forceRefresh: boolean;
    provider?: string;
  }): Promise<TopCycleThemesResponse> {
    const url = topCycleThemesPaths.themes({
      teamId: params.teamId,
      forceRefresh: params.forceRefresh,
      provider: params.provider,
    });
    const response = await fetch(url);
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch top cycle themes: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = topCycleThemesResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid top cycle themes response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }

  async fetchCycleThemeIssues(params: {
    teamId: string;
    themeName: string;
  }): Promise<CycleThemeIssuesResponse> {
    const url = topCycleThemesPaths.themeIssues({
      teamId: params.teamId,
      themeName: params.themeName,
    });
    const response = await fetch(url);
    if (!response.ok) {
      throw new GatewayError(
        `Failed to fetch cycle theme issues: HTTP ${response.status}`,
      );
    }
    const payload: unknown = await response.json();
    const parsed = cycleThemeIssuesResponseGuard.safeParse(payload);
    if (!parsed.success) {
      throw new GatewayError(
        `Invalid cycle theme issues response payload: ${parsed.error.message}`,
      );
    }
    return parsed.data;
  }
}
