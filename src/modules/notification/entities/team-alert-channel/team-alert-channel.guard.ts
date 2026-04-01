import { createGuard } from '@shared/foundation/guard/guard.js';
import { teamAlertChannelPropsSchema } from './team-alert-channel.schema.js';

export const teamAlertChannelGuard = createGuard(
  teamAlertChannelPropsSchema,
  'TeamAlertChannel',
);
