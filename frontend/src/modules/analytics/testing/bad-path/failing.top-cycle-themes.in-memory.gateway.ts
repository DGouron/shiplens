import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TopCycleThemesGateway } from '../../entities/top-cycle-themes/top-cycle-themes.gateway.ts';

export class FailingTopCycleThemesGateway extends TopCycleThemesGateway {
  async fetchTopCycleThemes(): Promise<never> {
    throw new GatewayError('Failed to fetch top cycle themes');
  }

  async fetchCycleThemeIssues(): Promise<never> {
    throw new GatewayError('Failed to fetch cycle theme issues');
  }
}
