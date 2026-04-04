const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const HOURS_PER_DAY = WORK_END_HOUR - WORK_START_HOUR;

function getLocalHour(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(
    parts.find((part) => part.type === 'minute')?.value ?? 0,
  );
  return hour + minute / 60;
}

function getLocalWeekday(date: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  });
  const weekday = formatter.format(date);
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return weekdayMap[weekday] ?? 0;
}

function isWorkingDay(date: Date, timezone: string): boolean {
  const weekday = getLocalWeekday(date, timezone);
  return weekday >= 1 && weekday <= 5;
}

function getStartOfLocalDay(date: Date, timezone: string): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  return new Date(`${year}-${month}-${day}T00:00:00Z`);
}

function businessHoursForDay(
  date: Date,
  timezone: string,
  effectiveStart: number,
  effectiveEnd: number,
): number {
  if (!isWorkingDay(date, timezone)) return 0;

  const clampedStart = Math.max(effectiveStart, WORK_START_HOUR);
  const clampedEnd = Math.min(effectiveEnd, WORK_END_HOUR);

  return Math.max(0, clampedEnd - clampedStart);
}

export function calculateBusinessHours(
  from: string,
  to: string,
  timezone: string,
): number {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (fromDate >= toDate) return 0;

  const fromLocalDay = getStartOfLocalDay(fromDate, timezone);
  const toLocalDay = getStartOfLocalDay(toDate, timezone);

  if (fromLocalDay.getTime() === toLocalDay.getTime()) {
    const startHour = getLocalHour(fromDate, timezone);
    const endHour = getLocalHour(toDate, timezone);
    return businessHoursForDay(fromDate, timezone, startHour, endHour);
  }

  let totalHours = 0;

  const fromHour = getLocalHour(fromDate, timezone);
  totalHours += businessHoursForDay(
    fromDate,
    timezone,
    fromHour,
    WORK_END_HOUR,
  );

  const current = new Date(fromLocalDay);
  current.setUTCDate(current.getUTCDate() + 1);

  while (current.getTime() < toLocalDay.getTime()) {
    if (isWorkingDay(current, timezone)) {
      totalHours += HOURS_PER_DAY;
    }
    current.setUTCDate(current.getUTCDate() + 1);
  }

  const toHour = getLocalHour(toDate, timezone);
  totalHours += businessHoursForDay(toDate, timezone, WORK_START_HOUR, toHour);

  return totalHours;
}
