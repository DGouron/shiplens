import { type TeamReferenceData } from './reference-data.schema.js';

export abstract class ReferenceDataGateway {
  abstract upsertForTeam(
    teamId: string,
    data: TeamReferenceData,
  ): Promise<void>;
}
