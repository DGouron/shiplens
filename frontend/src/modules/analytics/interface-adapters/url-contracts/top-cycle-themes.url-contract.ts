export const TOP_CYCLE_THEMES_QUERY_PARAM = {
  refresh: 'refresh',
  provider: 'provider',
} as const;

export const topCycleThemesPaths = {
  themes: (params: {
    teamId: string;
    forceRefresh: boolean;
    provider?: string;
  }): string => {
    const base = `/analytics/cycle-themes/${encodeURIComponent(params.teamId)}`;
    const query: string[] = [];
    if (params.forceRefresh) {
      query.push(`${TOP_CYCLE_THEMES_QUERY_PARAM.refresh}=true`);
    }
    if (params.provider !== undefined) {
      query.push(
        `${TOP_CYCLE_THEMES_QUERY_PARAM.provider}=${encodeURIComponent(params.provider)}`,
      );
    }
    if (query.length === 0) {
      return base;
    }
    return `${base}?${query.join('&')}`;
  },
  themeIssues: (params: { teamId: string; themeName: string }): string =>
    `/analytics/cycle-themes/${encodeURIComponent(params.teamId)}/themes/${encodeURIComponent(params.themeName)}/issues`,
} as const;
