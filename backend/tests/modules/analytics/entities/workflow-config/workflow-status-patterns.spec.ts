import {
  FALLBACK_COMPLETED_STATUSES,
  FALLBACK_STARTED_STATUSES,
  matchCompletedStatuses,
  matchStartedStatuses,
} from '@modules/analytics/entities/workflow-config/workflow-status-patterns.js';
import { describe, expect, it } from 'vitest';

describe('WorkflowStatusPatterns', () => {
  describe('matchStartedStatuses', () => {
    it('matches "In Progress" against started patterns', () => {
      const result = matchStartedStatuses(['In Progress', 'Todo', 'Done']);

      expect(result).toEqual(['In Progress']);
    });

    it('matches "In Dev" against started patterns', () => {
      const result = matchStartedStatuses(['In Dev', 'In Review', 'Done']);

      expect(result).toEqual(['In Dev']);
    });

    it('matches multiple started statuses', () => {
      const result = matchStartedStatuses(['In Progress', 'In Dev', 'Started']);

      expect(result).toEqual(['In Progress', 'In Dev', 'Started']);
    });

    it('matches case-insensitively', () => {
      const result = matchStartedStatuses(['IN PROGRESS', 'in dev']);

      expect(result).toEqual(['IN PROGRESS', 'in dev']);
    });

    it('returns empty array when no statuses match', () => {
      const result = matchStartedStatuses(['Phase1', 'Phase2', 'Phase3']);

      expect(result).toEqual([]);
    });

    it('matches "Doing" against started patterns', () => {
      const result = matchStartedStatuses(['Doing', 'Done']);

      expect(result).toEqual(['Doing']);
    });

    it('matches "In Development" against started patterns', () => {
      const result = matchStartedStatuses(['In Development', 'Done']);

      expect(result).toEqual(['In Development']);
    });
  });

  describe('matchCompletedStatuses', () => {
    it('matches "Done" against completed patterns', () => {
      const result = matchCompletedStatuses(['In Progress', 'Todo', 'Done']);

      expect(result).toEqual(['Done']);
    });

    it('matches multiple completed statuses', () => {
      const result = matchCompletedStatuses(['Done', 'Completed', 'Closed']);

      expect(result).toEqual(['Done', 'Completed', 'Closed']);
    });

    it('matches case-insensitively', () => {
      const result = matchCompletedStatuses(['done', 'SHIPPED']);

      expect(result).toEqual(['done', 'SHIPPED']);
    });

    it('matches "Released" against completed patterns', () => {
      const result = matchCompletedStatuses(['Released']);

      expect(result).toEqual(['Released']);
    });

    it('returns empty array when no statuses match', () => {
      const result = matchCompletedStatuses(['Phase1', 'Phase2']);

      expect(result).toEqual([]);
    });
  });

  describe('fallback constants', () => {
    it('provides fallback started statuses', () => {
      expect([...FALLBACK_STARTED_STATUSES]).toEqual([
        'In Progress',
        'Started',
      ]);
    });

    it('provides fallback completed statuses', () => {
      expect([...FALLBACK_COMPLETED_STATUSES]).toEqual(['Done', 'Completed']);
    });
  });
});
