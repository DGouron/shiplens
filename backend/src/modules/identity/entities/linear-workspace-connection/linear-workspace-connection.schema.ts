import { z } from 'zod';

export const linearWorkspaceConnectionSchema = z.object({
  id: z.string().min(1),
  workspaceId: z.string().min(1),
  workspaceName: z.string().min(1),
  encryptedAccessToken: z.string().min(1),
  encryptedRefreshToken: z.string(),
  grantedScopes: z.array(z.string().min(1)).min(1),
  status: z.enum(['connected', 'disconnected']),
  connectedAt: z.date(),
  updatedAt: z.date(),
});

export type LinearWorkspaceConnectionProps = z.infer<
  typeof linearWorkspaceConnectionSchema
>;
