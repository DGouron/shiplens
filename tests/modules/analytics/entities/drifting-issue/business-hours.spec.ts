import { calculateBusinessHours } from '@modules/analytics/entities/drifting-issue/business-hours.js';
import { describe, expect, it } from 'vitest';

const PARIS = 'Europe/Paris';

describe('calculateBusinessHours', () => {
  it('counts hours within a single working day', () => {
    const from = '2026-04-06T09:00:00+02:00'; // Monday 9h Paris
    const to = '2026-04-06T13:00:00+02:00'; // Monday 13h Paris
    expect(calculateBusinessHours(from, to, PARIS)).toBe(4);
  });

  it('caps at 9 hours for a full working day', () => {
    const from = '2026-04-06T07:00:00+02:00'; // Monday 7h (before work)
    const to = '2026-04-06T20:00:00+02:00'; // Monday 20h (after work)
    expect(calculateBusinessHours(from, to, PARIS)).toBe(9);
  });

  it('counts zero hours outside working hours on same day', () => {
    const from = '2026-04-06T19:00:00+02:00'; // Monday 19h
    const to = '2026-04-06T20:00:00+02:00'; // Monday 20h
    expect(calculateBusinessHours(from, to, PARIS)).toBe(0);
  });

  it('skips weekend days entirely', () => {
    const from = '2026-04-10T09:00:00+02:00'; // Friday 9h
    const to = '2026-04-13T09:00:00+02:00'; // Monday 9h
    expect(calculateBusinessHours(from, to, PARIS)).toBe(9); // only Friday
  });

  it('counts correctly across a weekend (spec: vendredi 16h → lundi 10h = 3h)', () => {
    const from = '2026-04-10T16:00:00+02:00'; // Friday 16h
    const to = '2026-04-13T10:00:00+02:00'; // Monday 10h
    expect(calculateBusinessHours(from, to, PARIS)).toBe(3); // 2h Friday + 1h Monday
  });

  it('counts correctly across evening (spec: 17h → lendemain 10h = 2h)', () => {
    const from = '2026-04-06T17:00:00+02:00'; // Monday 17h
    const to = '2026-04-07T10:00:00+02:00'; // Tuesday 10h
    expect(calculateBusinessHours(from, to, PARIS)).toBe(2); // 1h Monday + 1h Tuesday
  });

  it('counts multiple full working days', () => {
    const from = '2026-04-06T09:00:00+02:00'; // Monday 9h
    const to = '2026-04-10T18:00:00+02:00'; // Friday 18h
    expect(calculateBusinessHours(from, to, PARIS)).toBe(45); // 5 days * 9h
  });

  it('handles start before business hours', () => {
    const from = '2026-04-06T06:00:00+02:00'; // Monday 6h
    const to = '2026-04-06T12:00:00+02:00'; // Monday 12h
    expect(calculateBusinessHours(from, to, PARIS)).toBe(3); // 9h-12h = 3h
  });

  it('handles end after business hours', () => {
    const from = '2026-04-06T15:00:00+02:00'; // Monday 15h
    const to = '2026-04-06T22:00:00+02:00'; // Monday 22h
    expect(calculateBusinessHours(from, to, PARIS)).toBe(3); // 15h-18h = 3h
  });

  it('returns zero when from equals to', () => {
    const date = '2026-04-06T12:00:00+02:00';
    expect(calculateBusinessHours(date, date, PARIS)).toBe(0);
  });

  it('returns zero when both dates are on weekend', () => {
    const from = '2026-04-11T10:00:00+02:00'; // Saturday
    const to = '2026-04-12T15:00:00+02:00'; // Sunday
    expect(calculateBusinessHours(from, to, PARIS)).toBe(0);
  });

  it('works with a different timezone', () => {
    const from = '2026-04-06T09:00:00-04:00'; // Monday 9h New York
    const to = '2026-04-06T13:00:00-04:00'; // Monday 13h New York
    expect(calculateBusinessHours(from, to, 'America/New_York')).toBe(4);
  });

  it('handles UTC dates correctly with Paris timezone', () => {
    const from = '2026-04-06T07:00:00Z'; // = 9h Paris (UTC+2)
    const to = '2026-04-06T11:00:00Z'; // = 13h Paris (UTC+2)
    expect(calculateBusinessHours(from, to, PARIS)).toBe(4);
  });

  it('counts across multiple days (Mon 9h → Thu 14h = 32h)', () => {
    const from = '2026-04-06T09:00:00+02:00'; // Monday 9h
    const to = '2026-04-09T14:00:00+02:00'; // Thursday 14h
    // Mon: 9h, Tue: 9h, Wed: 9h, Thu: 5h = 32h
    expect(calculateBusinessHours(from, to, PARIS)).toBe(32);
  });
});
