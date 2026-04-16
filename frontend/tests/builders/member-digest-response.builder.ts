import { type MemberDigestResponse } from '@/modules/analytics/entities/member-digest/member-digest.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class MemberDigestResponseBuilder extends EntityBuilder<
  MemberDigestResponse,
  MemberDigestResponse
> {
  constructor() {
    super({
      memberName: 'Alice',
      digest: '# Member Digest\n\nDefault content.',
    });
  }

  withMemberName(memberName: string): this {
    this.props.memberName = memberName;
    return this;
  }

  withDigest(digest: string | null): this {
    this.props.digest = digest;
    return this;
  }

  build(): MemberDigestResponse {
    return { ...this.props };
  }
}
