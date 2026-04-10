import { type TeamReferenceData } from './reference-data.schema.js';

export abstract class LinearReferenceDataGateway {
  abstract getTeamReferenceData(
    accessToken: string,
    teamId: string,
  ): Promise<TeamReferenceData>;
}
