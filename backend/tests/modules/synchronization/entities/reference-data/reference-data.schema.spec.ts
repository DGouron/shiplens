import {
  labelSchema,
  milestoneSchema,
  projectSchema,
  teamMemberSchema,
  teamReferenceDataSchema,
  workflowStatusSchema,
} from '@modules/synchronization/entities/reference-data/reference-data.schema.js';
import { describe, expect, it } from 'vitest';

describe('ReferenceDataSchema', () => {
  describe('labelSchema', () => {
    it('validates a valid label', () => {
      const result = labelSchema.safeParse({
        externalId: 'label-1',
        teamId: 'team-1',
        name: 'Bug',
        color: '#ff0000',
      });

      expect(result.success).toBe(true);
    });

    it('rejects a label without name', () => {
      const result = labelSchema.safeParse({
        externalId: 'label-1',
        teamId: 'team-1',
        color: '#ff0000',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('workflowStatusSchema', () => {
    it('validates a valid workflow status', () => {
      const result = workflowStatusSchema.safeParse({
        externalId: 'status-1',
        teamId: 'team-1',
        name: 'In Progress',
        position: 2,
      });

      expect(result.success).toBe(true);
    });

    it('rejects a workflow status without position', () => {
      const result = workflowStatusSchema.safeParse({
        externalId: 'status-1',
        teamId: 'team-1',
        name: 'In Progress',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('teamMemberSchema', () => {
    it('validates a valid team member', () => {
      const result = teamMemberSchema.safeParse({
        externalId: 'member-1',
        teamId: 'team-1',
        name: 'Alice',
        role: 'admin',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('milestoneSchema', () => {
    it('validates a valid milestone', () => {
      const result = milestoneSchema.safeParse({
        externalId: 'milestone-1',
        projectExternalId: 'project-1',
        name: 'v1.0',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('projectSchema', () => {
    it('validates a valid project with milestones', () => {
      const result = projectSchema.safeParse({
        externalId: 'project-1',
        teamId: 'team-1',
        name: 'Website Redesign',
        milestones: [
          {
            externalId: 'ms-1',
            projectExternalId: 'project-1',
            name: 'Phase 1',
          },
        ],
      });

      expect(result.success).toBe(true);
    });

    it('validates a project with empty milestones', () => {
      const result = projectSchema.safeParse({
        externalId: 'project-1',
        teamId: 'team-1',
        name: 'Website Redesign',
        milestones: [],
      });

      expect(result.success).toBe(true);
    });
  });

  describe('teamReferenceDataSchema', () => {
    it('validates a complete team reference data object', () => {
      const result = teamReferenceDataSchema.safeParse({
        teamId: 'team-1',
        labels: [
          { externalId: 'l-1', teamId: 'team-1', name: 'Bug', color: '#f00' },
        ],
        workflowStatuses: [
          { externalId: 's-1', teamId: 'team-1', name: 'Todo', position: 0 },
        ],
        teamMembers: [
          { externalId: 'm-1', teamId: 'team-1', name: 'Alice', role: 'admin' },
        ],
        projects: [
          {
            externalId: 'p-1',
            teamId: 'team-1',
            name: 'Project A',
            milestones: [],
          },
        ],
      });

      expect(result.success).toBe(true);
    });
  });
});
