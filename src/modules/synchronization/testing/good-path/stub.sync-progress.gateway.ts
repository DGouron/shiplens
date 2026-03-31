import { SyncProgressGateway } from '../../entities/sync-progress/sync-progress.gateway.js';
import { type SyncProgress } from '../../entities/sync-progress/sync-progress.js';

export class StubSyncProgressGateway extends SyncProgressGateway {
  progressByTeamId: Map<string, SyncProgress> = new Map();

  async save(progress: SyncProgress): Promise<void> {
    this.progressByTeamId.set(progress.teamId, progress);
  }

  async getByTeamId(teamId: string): Promise<SyncProgress | null> {
    return this.progressByTeamId.get(teamId) ?? null;
  }

  async getAll(): Promise<SyncProgress[]> {
    return Array.from(this.progressByTeamId.values());
  }
}
