import { type SyncProgress } from './sync-progress.js';

export abstract class SyncProgressGateway {
  abstract save(progress: SyncProgress): Promise<void>;
  abstract getByTeamId(teamId: string): Promise<SyncProgress | null>;
  abstract getAll(): Promise<SyncProgress[]>;
}
