import {
  type CycleThemeIssuesResponse,
  type TopCycleThemesResponse,
} from './top-cycle-themes.response.ts';

export abstract class TopCycleThemesGateway {
  abstract fetchTopCycleThemes(params: {
    teamId: string;
    forceRefresh: boolean;
    provider?: string;
  }): Promise<TopCycleThemesResponse>;

  abstract fetchCycleThemeIssues(params: {
    teamId: string;
    themeName: string;
  }): Promise<CycleThemeIssuesResponse>;
}
