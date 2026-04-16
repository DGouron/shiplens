import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import {
  type GenerateMemberDigestParams,
  type MemberDigestGateway,
} from '../entities/member-digest/member-digest.gateway.ts';
import { type MemberDigestResponse } from '../entities/member-digest/member-digest.response.ts';

export class GenerateMemberDigestUsecase
  implements Usecase<GenerateMemberDigestParams, MemberDigestResponse>
{
  constructor(private readonly gateway: MemberDigestGateway) {}

  async execute(
    params: GenerateMemberDigestParams,
  ): Promise<MemberDigestResponse> {
    return this.gateway.generate(params);
  }
}
