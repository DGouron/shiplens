import { CycleThemeSet } from '../../entities/cycle-theme-set/cycle-theme-set.js';
import { CycleThemeSetCacheGateway } from '../../entities/cycle-theme-set/cycle-theme-set-cache.gateway.js';

export class StubCycleThemeSetCacheGateway extends CycleThemeSetCacheGateway {
  private entries: Map<string, CycleThemeSet> = new Map();

  async get(cycleId: string): Promise<CycleThemeSet | null> {
    return this.entries.get(cycleId) ?? null;
  }

  async save(themeSet: CycleThemeSet): Promise<void> {
    this.entries.set(themeSet.cycleId, themeSet);
  }

  async delete(cycleId: string): Promise<void> {
    this.entries.delete(cycleId);
  }

  seed(themeSet: CycleThemeSet): void {
    this.entries.set(themeSet.cycleId, themeSet);
  }
}
