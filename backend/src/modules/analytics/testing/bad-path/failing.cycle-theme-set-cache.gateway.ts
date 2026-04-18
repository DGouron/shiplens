import { GatewayError } from '@shared/foundation/gateway-error.js';
import { type CycleThemeSet } from '../../entities/cycle-theme-set/cycle-theme-set.js';
import { CycleThemeSetCacheGateway } from '../../entities/cycle-theme-set/cycle-theme-set-cache.gateway.js';

export class FailingCycleThemeSetCacheGateway extends CycleThemeSetCacheGateway {
  async get(): Promise<CycleThemeSet | null> {
    throw new GatewayError('Gateway error: unable to read theme cache');
  }

  async save(): Promise<void> {
    throw new GatewayError('Gateway error: unable to write theme cache');
  }

  async delete(): Promise<void> {
    throw new GatewayError('Gateway error: unable to delete theme cache entry');
  }
}
