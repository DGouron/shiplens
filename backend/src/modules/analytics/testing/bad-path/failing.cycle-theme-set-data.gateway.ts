import { GatewayError } from '@shared/foundation/gateway-error.js';
import {
  type ActiveCycleLocator,
  type ThemeCandidateIssue,
} from '../../entities/cycle-theme-set/cycle-theme-set.schema.js';
import { CycleThemeSetDataGateway } from '../../entities/cycle-theme-set/cycle-theme-set-data.gateway.js';

export class FailingCycleThemeSetDataGateway extends CycleThemeSetDataGateway {
  async getActiveCycleLocator(): Promise<ActiveCycleLocator | null> {
    throw new GatewayError(
      'Gateway error: unable to fetch active cycle locator',
    );
  }

  async getCycleIssuesForThemeDetection(): Promise<ThemeCandidateIssue[]> {
    throw new GatewayError(
      'Gateway error: unable to fetch cycle issues for theme detection',
    );
  }
}
