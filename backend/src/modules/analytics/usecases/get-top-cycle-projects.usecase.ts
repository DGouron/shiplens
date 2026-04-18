import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { type CycleProjectAggregate } from '../entities/top-cycle-projects/top-cycle-projects.schema.js';
import { TopCycleProjectsDataGateway } from '../entities/top-cycle-projects/top-cycle-projects-data.gateway.js';
import { ResolveWorkflowConfigUsecase } from './resolve-workflow-config.usecase.js';

interface GetTopCycleProjectsParams {
  teamId: string;
}

type GetTopCycleProjectsResult =
  | { status: 'no_active_cycle' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      aggregates: CycleProjectAggregate[];
    };

@Injectable()
export class GetTopCycleProjectsUsecase
  implements Usecase<GetTopCycleProjectsParams, GetTopCycleProjectsResult>
{
  constructor(
    private readonly dataGateway: TopCycleProjectsDataGateway,
    private readonly resolveWorkflowConfig: ResolveWorkflowConfigUsecase,
  ) {}

  async execute(
    params: GetTopCycleProjectsParams,
  ): Promise<GetTopCycleProjectsResult> {
    const locator = await this.dataGateway.getActiveCycleLocator(params.teamId);

    if (locator === null) {
      return { status: 'no_active_cycle' };
    }

    const workflowConfig = await this.resolveWorkflowConfig.execute({
      teamId: params.teamId,
    });

    const aggregates = await this.dataGateway.getCycleProjectAggregates(
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
