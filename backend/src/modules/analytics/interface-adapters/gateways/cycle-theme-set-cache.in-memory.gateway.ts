import { Injectable } from '@nestjs/common';
import { CycleThemeSet } from '../../entities/cycle-theme-set/cycle-theme-set.js';
import { CycleThemeSetCacheGateway } from '../../entities/cycle-theme-set/cycle-theme-set-cache.gateway.js';

@Injectable()
export class CycleThemeSetCacheInMemoryGateway extends CycleThemeSetCacheGateway {
  private readonly entries: Map<string, CycleThemeSet> = new Map();

  async get(cycleId: string): Promise<CycleThemeSet | null> {
    return this.entries.get(cycleId) ?? null;
  }

  async save(themeSet: CycleThemeSet): Promise<void> {
    this.entries.set(themeSet.cycleId, themeSet);
  }

  async delete(cycleId: string): Promise<void> {
    this.entries.delete(cycleId);
  }
}
