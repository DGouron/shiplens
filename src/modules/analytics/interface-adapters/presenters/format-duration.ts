export function formatDuration(hours: number): string {
  if (hours === 0) return '0h';

  if (hours < 1) {
    return `${hours.toFixed(1)}h`;
  }

  if (hours <= 36) {
    return `${Math.round(hours)}h`;
  }

  const days = hours / 24;
  return `${days.toFixed(1)}j`;
}
