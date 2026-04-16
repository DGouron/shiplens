import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { NoCompletedCyclesError } from '../entities/member-health/member-health.errors.js';
import { MemberHealth } from '../entities/member-health/member-health.js';
import { MemberHealthDataGateway } from '../entities/member-health/member-health-data.gateway.js';
import { ResolveWorkflowConfigUsecase } from './resolve-workflow-config.usecase.js';

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
    private readonly resolveWorkflowConfig: ResolveWorkflowConfigUsecase,
  ) {}

  async execute(params: GetMemberHealthParams): Promise<MemberHealth> {
    const workflowConfig = await this.resolveWorkflowConfig.execute({
      teamId: params.teamId,
    });

    const snapshots =
      await this.memberHealthDataGateway.getMemberCycleSnapshots(
        params.teamId,
        params.memberName,
        params.cycles,
        workflowConfig.startedStatuses,
        workflowConfig.completedStatuses,
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
