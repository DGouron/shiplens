export interface DurationHoursTranslations {
  daysSuffix: string;
}

export function formatDurationHours(
  hours: number,
  translations: DurationHoursTranslations,
): string {
  if (hours === 0) {
    return '0h';
  }
  if (hours < 1) {
    return `${hours.toFixed(1)}h`;
  }
  if (hours <= 36) {
    return `${Math.round(hours)}h`;
  }
  return `${(hours / 24).toFixed(1)} ${translations.daysSuffix}`;
}
