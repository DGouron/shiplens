import { type MemberDigestResponse } from './member-digest.response.ts';

export interface GenerateMemberDigestParams {
  cycleId: string;
  teamId: string;
  memberName: string;
}

export abstract class MemberDigestGateway {
  abstract generate(
    params: GenerateMemberDigestParams,
  ): Promise<MemberDigestResponse>;
}
