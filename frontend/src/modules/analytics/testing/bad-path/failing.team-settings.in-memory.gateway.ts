import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TeamSettingsGateway } from '../../entities/team-settings/team-settings.gateway.ts';

export class FailingTeamSettingsGateway extends TeamSettingsGateway {
  async getTimezone(): Promise<never> {
    throw new GatewayError('Failed to fetch timezone');
  }

  async setTimezone(): Promise<never> {
    throw new GatewayError('Failed to set timezone');
  }

  async getAvailableStatuses(): Promise<never> {
    throw new GatewayError('Failed to fetch available statuses');
  }

  async getExcludedStatuses(): Promise<never> {
    throw new GatewayError('Failed to fetch excluded statuses');
  }

  async setExcludedStatuses(): Promise<never> {
    throw new GatewayError('Failed to set excluded statuses');
  }
}
