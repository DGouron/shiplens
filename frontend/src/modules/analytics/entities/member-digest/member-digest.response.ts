import { type z } from 'zod';
import { type memberDigestResponseSchema } from './member-digest.response.schema.ts';

export type MemberDigestResponse = z.infer<typeof memberDigestResponseSchema>;
