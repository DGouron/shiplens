import { createGuard } from '@/shared/foundation/guard/guard.ts';
import {
  syncAvailableTeamsResponseSchema,
  syncSelectionResponseSchema,
} from '../../entities/sync/sync.response.schema.ts';

export const syncAvailableTeamsResponseGuard = createGuard(
  syncAvailableTeamsResponseSchema,
  'SyncAvailableTeamsResponse',
);

export const syncSelectionResponseGuard = createGuard(
  syncSelectionResponseSchema,
  'SyncSelectionResponse',
);
