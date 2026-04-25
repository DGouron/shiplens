const EPIC_POINTS_THRESHOLD = 21;

export function isProbableEpic(points: number | null): boolean {
  if (points === null) return true;
  if (points === 0) return true;
  return points >= EPIC_POINTS_THRESHOLD;
}
