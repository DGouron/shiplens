import { ReferenceDataGateway } from '../../entities/reference-data/reference-data.gateway.js';
import { type TeamReferenceData } from '../../entities/reference-data/reference-data.schema.js';

export class StubReferenceDataGateway extends ReferenceDataGateway {
  dataByTeamId: Map<string, TeamReferenceData> = new Map();

  async upsertForTeam(teamId: string, data: TeamReferenceData): Promise<void> {
    this.dataByTeamId.set(teamId, data);
  }
}
