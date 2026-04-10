import { AvailableStatusesGateway } from '../../entities/team-settings/available-statuses.gateway.js';

export class StubAvailableStatusesGateway extends AvailableStatusesGateway {
  statuses: Map<string, string[]> = new Map();

  async getDistinctStatusNames(teamId: string): Promise<string[]> {
    return this.statuses.get(teamId) ?? [];
  }
}
