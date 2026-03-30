import { GatewayError } from '@shared/foundation/gateway-error.js';
import { LinearReferenceDataGateway } from '../../entities/reference-data/linear-reference-data.gateway.js';
import { type TeamReferenceData } from '../../entities/reference-data/reference-data.schema.js';

export class FailingLinearReferenceDataGateway extends LinearReferenceDataGateway {
  async getTeamReferenceData(
    _accessToken: string,
    _teamId: string,
  ): Promise<TeamReferenceData> {
    throw new GatewayError('Échec de la requête Linear API');
  }
}
