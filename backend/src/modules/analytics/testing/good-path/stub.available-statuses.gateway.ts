import { AvailableStatusesGateway } from '../../entities/team-settings/available-statuses.gateway.js';

export class StubAvailableStatusesGateway extends AvailableStatusesGateway {
  statuses: Map<string, string[]> = new Map();
  transitionStatuses: Map<string, string[]> = new Map();

  async getDistinctStatusNames(teamId: string): Promise<string[]> {
    return this.statuses.get(teamId) ?? [];
  }

  async getDistinctTransitionStatusNames(teamId: string): Promise<string[]> {
    return this.transitionStatuses.get(teamId) ?? [];
  }
}
