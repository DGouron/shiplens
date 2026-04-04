const SPLITTING_THRESHOLD = 8;

export const DRIFT_GRID: ReadonlyArray<{
  points: number;
  maxBusinessHours: number;
}> = [
  { points: 1, maxBusinessHours: 4 },
  { points: 2, maxBusinessHours: 6 },
  { points: 3, maxBusinessHours: 8 },
  { points: 5, maxBusinessHours: 20 },
];

const pointsToMaxHours = new Map(
  DRIFT_GRID.map((entry) => [entry.points, entry.maxBusinessHours]),
);

export function getMaxBusinessHours(points: number): number | null {
  return pointsToMaxHours.get(points) ?? null;
}

export function requiresSplitting(points: number): boolean {
  return points >= SPLITTING_THRESHOLD;
}
