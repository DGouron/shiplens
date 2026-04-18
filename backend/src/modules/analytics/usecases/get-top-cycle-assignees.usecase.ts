import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { type CycleAssigneeAggregate } from '../entities/top-cycle-assignees/top-cycle-assignees.schema.js';
import { TopCycleAssigneesDataGateway } from '../entities/top-cycle-assignees/top-cycle-assignees-data.gateway.js';
import { ResolveWorkflowConfigUsecase } from './resolve-workflow-config.usecase.js';

interface GetTopCycleAssigneesParams {
  teamId: string;
}

type GetTopCycleAssigneesResult =
  | { status: 'no_active_cycle' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      aggregates: CycleAssigneeAggregate[];
    };

@Injectable()
export class GetTopCycleAssigneesUsecase
  implements Usecase<GetTopCycleAssigneesParams, GetTopCycleAssigneesResult>
{
  constructor(
    private readonly dataGateway: TopCycleAssigneesDataGateway,
    private readonly resolveWorkflowConfig: ResolveWorkflowConfigUsecase,
  ) {}

  async execute(
    params: GetTopCycleAssigneesParams,
  ): Promise<GetTopCycleAssigneesResult> {
    const locator = await this.dataGateway.getActiveCycleLocator(params.teamId);

    if (locator === null) {
      return { status: 'no_active_cycle' };
    }

    const workflowConfig = await this.resolveWorkflowConfig.execute({
      teamId: params.teamId,
    });

    const aggregates = await this.dataGateway.getCycleAssigneeAggregates(
      params.teamId,
      locator.cycleId,
      [...workflowConfig.startedStatuses],
      [...workflowConfig.completedStatuses],
    );

    return {
      status: 'ready',
      cycleId: locator.cycleId,
      cycleName: locator.cycleName,
      aggregates,
    };
  }
}
