import { createGuard } from '@/shared/foundation/guard/guard.ts';
import {
  statusListResponseSchema,
  timezoneResponseSchema,
} from '../../entities/team-settings/team-settings.response.schema.ts';

export const timezoneResponseGuard = createGuard(
  timezoneResponseSchema,
  'TimezoneResponse',
);

export const statusListResponseGuard = createGuard(
  statusListResponseSchema,
  'StatusListResponse',
);
