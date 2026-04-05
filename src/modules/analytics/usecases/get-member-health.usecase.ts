import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { NoCompletedCyclesError } from '../entities/member-health/member-health.errors.js';
import { MemberHealth } from '../entities/member-health/member-health.js';
import { MemberHealthDataGateway } from '../entities/member-health/member-health-data.gateway.js';

export interface GetMemberHealthParams {
  teamId: string;
  memberName: string;
  cycles: number;
}

@Injectable()
export class GetMemberHealthUsecase
  implements Usecase<GetMemberHealthParams, MemberHealth>
{
  constructor(
    private readonly memberHealthDataGateway: MemberHealthDataGateway,
  ) {}

  async execute(params: GetMemberHealthParams): Promise<MemberHealth> {
    const snapshots =
      await this.memberHealthDataGateway.getMemberCycleSnapshots(
        params.teamId,
        params.memberName,
        params.cycles,
      );

    if (snapshots.length === 0) {
      throw new NoCompletedCyclesError();
    }

    return MemberHealth.create({
      teamId: params.teamId,
      memberName: params.memberName,
      cycleSnapshots: snapshots,
    });
  }
}
