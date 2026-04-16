import {
  type FetchMemberHealthParams,
  MemberHealthGateway,
} from '../../entities/member-health/member-health.gateway.ts';
import { type MemberHealthResponse } from '../../entities/member-health/member-health.response.ts';

interface StubMemberHealthGatewayOptions {
  response?: MemberHealthResponse | null;
}

const defaultResponse: MemberHealthResponse = {
  teamId: 'team-1',
  memberName: 'Alice',
  estimationScore: { value: '75%', trend: 'rising', indicator: 'green' },
  underestimationRatio: { value: '10%', trend: 'falling', indicator: 'green' },
  averageCycleTime: { value: '2.0d', trend: 'stable', indicator: 'green' },
  driftingTickets: { value: '2', trend: 'falling', indicator: 'green' },
  medianReviewTime: { value: '3h', trend: 'stable', indicator: 'green' },
};

export class StubMemberHealthGateway extends MemberHealthGateway {
  private readonly response: MemberHealthResponse | null;
  calls: FetchMemberHealthParams[] = [];

  constructor(options: StubMemberHealthGatewayOptions = {}) {
    super();
    this.response =
      options.response === undefined ? defaultResponse : options.response;
  }

  async fetchMemberHealth(
    params: FetchMemberHealthParams,
  ): Promise<MemberHealthResponse | null> {
    this.calls.push(params);
    return this.response;
  }
}
