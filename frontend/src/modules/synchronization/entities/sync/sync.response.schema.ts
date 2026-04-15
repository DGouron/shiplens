import { z } from 'zod';

export const syncProjectResponseSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
});

export const syncAvailableTeamResponseSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
  projects: z.array(syncProjectResponseSchema),
});

export const syncAvailableTeamsResponseSchema = z.array(
  syncAvailableTeamResponseSchema,
);

export const syncSelectedTeamResponseSchema = z.object({
  teamId: z.string(),
  teamName: z.string(),
});

export const syncSelectedProjectResponseSchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  teamId: z.string(),
});

export const syncSelectionResponseSchema = z.nullable(
  z.object({
    selectedTeams: z.array(syncSelectedTeamResponseSchema),
    selectedProjects: z.array(syncSelectedProjectResponseSchema),
  }),
);
