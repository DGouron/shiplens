import {
  type GenerateMemberDigestParams,
  MemberDigestGateway,
} from '../../entities/member-digest/member-digest.gateway.ts';
import { type MemberDigestResponse } from '../../entities/member-digest/member-digest.response.ts';

interface StubMemberDigestGatewayOptions {
  digestByMember?: Record<string, string | null>;
}

export class StubMemberDigestGateway extends MemberDigestGateway {
  private readonly digestByMember: Record<string, string | null>;
  generateCalls: GenerateMemberDigestParams[] = [];

  constructor(options: StubMemberDigestGatewayOptions) {
    super();
    this.digestByMember = { ...(options.digestByMember ?? {}) };
  }

  async generate(
    params: GenerateMemberDigestParams,
  ): Promise<MemberDigestResponse> {
    this.generateCalls.push(params);
    const digest = this.digestByMember[params.memberName] ?? null;
    return { memberName: params.memberName, digest };
  }
}
