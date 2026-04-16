const STARTED_PATTERNS = [
  'progress',
  'dev',
  'doing',
  'started',
  'in development',
] as const;

const COMPLETED_PATTERNS = [
  'done',
  'completed',
  'closed',
  'shipped',
  'released',
] as const;

export const FALLBACK_STARTED_STATUSES = ['In Progress', 'Started'] as const;

export const FALLBACK_COMPLETED_STATUSES = ['Done', 'Completed'] as const;

function matchesAnyPattern(
  statusName: string,
  patterns: readonly string[],
): boolean {
  const lowerStatus = statusName.toLowerCase();
  return patterns.some((pattern) => lowerStatus.includes(pattern));
}

export function matchStartedStatuses(statusNames: string[]): string[] {
  return statusNames.filter((name) =>
    matchesAnyPattern(name, STARTED_PATTERNS),
  );
}

export function matchCompletedStatuses(statusNames: string[]): string[] {
  return statusNames.filter((name) =>
    matchesAnyPattern(name, COMPLETED_PATTERNS),
  );
}
