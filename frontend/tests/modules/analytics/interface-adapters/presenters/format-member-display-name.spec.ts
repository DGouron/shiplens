import { describe, expect, it } from 'vitest';
import { formatMemberDisplayName } from '@/modules/analytics/interface-adapters/presenters/format-member-display-name.ts';

describe('formatMemberDisplayName', () => {
  it('returns the capitalized local part of an email address', () => {
    expect(formatMemberDisplayName('gauthier@mentorgoal.com')).toBe('Gauthier');
  });

  it('preserves an already capitalized local part', () => {
    expect(formatMemberDisplayName('Damien@mentorgoal.com')).toBe('Damien');
  });

  it('capitalizes when the source is not an email by capitalizing its first letter', () => {
    expect(formatMemberDisplayName('gauthier')).toBe('Gauthier');
  });

  it('returns an empty string when given an empty string', () => {
    expect(formatMemberDisplayName('')).toBe('');
  });

  it('trims whitespace before formatting', () => {
    expect(formatMemberDisplayName('  alice@example.com  ')).toBe('Alice');
  });
});
