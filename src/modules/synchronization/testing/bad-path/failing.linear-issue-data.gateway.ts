import { GatewayError } from '@shared/foundation/gateway-error.js';
import { LinearIssueDataGateway } from '../../entities/issue-data/linear-issue-data.gateway.js';
import { type PaginatedIssues, type CycleData, type StateTransitionData } from '../../entities/issue-data/issue-data.schema.js';

export class FailingLinearIssueDataGateway extends LinearIssueDataGateway {
  async getIssuesPage(
    _accessToken: string,
    _teamId: string,
    _cursor: string | null,
  ): Promise<PaginatedIssues> {
    throw new GatewayError('Échec de la requête Linear API', { status: 500 });
  }

  async getCycles(
    _accessToken: string,
    _teamId: string,
  ): Promise<CycleData[]> {
    throw new GatewayError('Échec de la requête Linear API', { status: 500 });
  }

  async getIssueHistory(
    _accessToken: string,
    _teamId: string,
    _issueExternalIds: string[],
  ): Promise<StateTransitionData[]> {
    throw new GatewayError('Échec de la requête Linear API', { status: 500 });
  }
}
