import { z } from 'zod';

export const memberDigestResponseSchema = z.object({
  memberName: z.string(),
  digest: z.nullable(z.string()),
});
