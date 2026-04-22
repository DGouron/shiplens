import { TopCycleThemesGateway } from '../../entities/top-cycle-themes/top-cycle-themes.gateway.ts';
import {
  type CycleThemeIssuesResponse,
  type TopCycleThemesResponse,
} from '../../entities/top-cycle-themes/top-cycle-themes.response.ts';

interface StubTopCycleThemesGatewayOptions {
  themes?: TopCycleThemesResponse;
  themesByTeamId?: Record<string, TopCycleThemesResponse>;
  issuesByThemeName?: Record<string, CycleThemeIssuesResponse>;
}

export class StubTopCycleThemesGateway extends TopCycleThemesGateway {
  private readonly themes: TopCycleThemesResponse;
  private readonly themesByTeamId: Record<string, TopCycleThemesResponse>;
  private readonly issuesByThemeName: Record<string, CycleThemeIssuesResponse>;
  topCallCount = 0;
  issuesCallCount = 0;
  lastForceRefresh = false;
  lastProvider: string | undefined = undefined;
  lastTeamId: string | null = null;
  lastIssuesCall: { teamId: string; themeName: string } | null = null;

  constructor(options: StubTopCycleThemesGatewayOptions = {}) {
    super();
    this.themes = options.themes ?? { status: 'no_active_cycle' };
    this.themesByTeamId = options.themesByTeamId ?? {};
    this.issuesByThemeName = options.issuesByThemeName ?? {};
  }

  async fetchTopCycleThemes(params: {
    teamId: string;
    forceRefresh: boolean;
    provider?: string;
  }): Promise<TopCycleThemesResponse> {
    this.topCallCount += 1;
    this.lastForceRefresh = params.forceRefresh;
    this.lastProvider = params.provider;
    this.lastTeamId = params.teamId;
    const byTeam = this.themesByTeamId[params.teamId];
    if (byTeam !== undefined) {
      return cloneThemes(byTeam);
    }
    return cloneThemes(this.themes);
  }

  async fetchCycleThemeIssues(params: {
    teamId: string;
    themeName: string;
  }): Promise<CycleThemeIssuesResponse> {
    this.issuesCallCount += 1;
    this.lastIssuesCall = {
      teamId: params.teamId,
      themeName: params.themeName,
    };
    const issues = this.issuesByThemeName[params.themeName];
    if (issues !== undefined) {
      return cloneIssues(issues);
    }
    return {
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Cycle 1',
      themeName: params.themeName,
      issues: [],
    };
  }
}

function cloneThemes(response: TopCycleThemesResponse): TopCycleThemesResponse {
  if (response.status === 'no_active_cycle') {
    return { status: 'no_active_cycle' };
  }
  if (response.status === 'below_threshold') {
    return { status: 'below_threshold', issueCount: response.issueCount };
  }
  if (response.status === 'ai_unavailable') {
    return { status: 'ai_unavailable' };
  }
  return {
    status: 'ready',
    cycleId: response.cycleId,
    cycleName: response.cycleName,
    language: response.language,
    fromCache: response.fromCache,
    themes: response.themes.map((theme) => ({ ...theme })),
  };
}

function cloneIssues(
  response: CycleThemeIssuesResponse,
): CycleThemeIssuesResponse {
  if (response.status === 'no_active_cycle') {
    return { status: 'no_active_cycle' };
  }
  if (response.status === 'theme_not_found') {
    return { status: 'theme_not_found' };
  }
  return {
    status: 'ready',
    cycleId: response.cycleId,
    cycleName: response.cycleName,
    themeName: response.themeName,
    issues: response.issues.map((issue) => ({ ...issue })),
  };
}
