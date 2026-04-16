import { type MemberHealthResponse } from './member-health.response.ts';

export interface FetchMemberHealthParams {
  teamId: string;
  memberName: string;
  cycles: number;
}

export abstract class MemberHealthGateway {
  abstract fetchMemberHealth(
    params: FetchMemberHealthParams,
  ): Promise<MemberHealthResponse | null>;
}
