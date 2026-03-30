import { z } from 'zod';

const selectedTeamSchema = z.object({
  teamId: z.string().min(1),
  teamName: z.string().min(1),
});

const selectedProjectSchema = z.object({
  projectId: z.string().min(1),
  projectName: z.string().min(1),
  teamId: z.string().min(1),
});

export const teamSelectionSchema = z.object({
  selectedTeams: z.array(selectedTeamSchema).min(1),
  selectedProjects: z.array(selectedProjectSchema),
});

export type SelectedTeamProps = z.infer<typeof selectedTeamSchema>;
export type SelectedProjectProps = z.infer<typeof selectedProjectSchema>;
export type TeamSelectionProps = z.infer<typeof teamSelectionSchema>;
