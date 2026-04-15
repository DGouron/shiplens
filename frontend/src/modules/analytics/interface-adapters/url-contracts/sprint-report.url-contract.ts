export const sprintReportPaths = {
  listForTeam: (teamId: string): string =>
    `/analytics/teams/${encodeURIComponent(teamId)}/reports`,
  detail: (reportId: string): string =>
    `/analytics/reports/${encodeURIComponent(reportId)}`,
  generate: (cycleId: string): string =>
    `/analytics/cycles/${encodeURIComponent(cycleId)}/report`,
} as const;
