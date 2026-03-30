import { z } from 'zod';

export const labelSchema = z.object({
  externalId: z.string().min(1),
  teamId: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
});

export const workflowStatusSchema = z.object({
  externalId: z.string().min(1),
  teamId: z.string().min(1),
  name: z.string().min(1),
  position: z.number(),
});

export const teamMemberSchema = z.object({
  externalId: z.string().min(1),
  teamId: z.string().min(1),
  name: z.string().min(1),
  role: z.string().min(1),
});

export const milestoneSchema = z.object({
  externalId: z.string().min(1),
  projectExternalId: z.string().min(1),
  name: z.string().min(1),
});

export const projectSchema = z.object({
  externalId: z.string().min(1),
  teamId: z.string().min(1),
  name: z.string().min(1),
  milestones: z.array(milestoneSchema),
});

export const teamReferenceDataSchema = z.object({
  teamId: z.string().min(1),
  labels: z.array(labelSchema),
  workflowStatuses: z.array(workflowStatusSchema),
  teamMembers: z.array(teamMemberSchema),
  projects: z.array(projectSchema),
});

export type Label = z.infer<typeof labelSchema>;
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>;
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type Project = z.infer<typeof projectSchema>;
export type TeamReferenceData = z.infer<typeof teamReferenceDataSchema>;
