import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import {
  type FetchMemberHealthParams,
  type MemberHealthGateway,
} from '../entities/member-health/member-health.gateway.ts';
import { type MemberHealthResponse } from '../entities/member-health/member-health.response.ts';

export class GetMemberHealthUsecase
  implements Usecase<FetchMemberHealthParams, MemberHealthResponse | null>
{
  constructor(private readonly gateway: MemberHealthGateway) {}

  async execute(
    params: FetchMemberHealthParams,
  ): Promise<MemberHealthResponse | null> {
    return this.gateway.fetchMemberHealth(params);
  }
}
