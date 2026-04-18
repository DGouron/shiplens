import { type CycleThemeSet } from './cycle-theme-set.js';

export abstract class CycleThemeSetCacheGateway {
  abstract get(cycleId: string): Promise<CycleThemeSet | null>;
  abstract save(themeSet: CycleThemeSet): Promise<void>;
  abstract delete(cycleId: string): Promise<void>;
}
