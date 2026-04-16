export const memberDigestPaths = {
  generate: (cycleId: string): string =>
    `/analytics/cycles/${encodeURIComponent(cycleId)}/member-digest`,
} as const;
