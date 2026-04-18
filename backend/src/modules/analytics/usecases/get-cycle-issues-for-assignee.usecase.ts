import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { type CycleAssigneeIssueDetail } from '../entities/top-cycle-assignees/top-cycle-assignees.schema.js';
import { TopCycleAssigneesDataGateway } from '../entities/top-cycle-assignees/top-cycle-assignees-data.gateway.js';
import { ResolveWorkflowConfigUsecase } from './resolve-workflow-config.usecase.js';

interface GetCycleIssuesForAssigneeParams {
  teamId: string;
  assigneeName: string;
}

type GetCycleIssuesForAssigneeResult =
  | { status: 'no_active_cycle' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      assigneeName: string;
      issues: CycleAssigneeIssueDetail[];
    };

@Injectable()
export class GetCycleIssuesForAssigneeUsecase
  implements
    Usecase<GetCycleIssuesForAssigneeParams, GetCycleIssuesForAssigneeResult>
{
  constructor(
    private readonly dataGateway: TopCycleAssigneesDataGateway,
    private readonly resolveWorkflowConfig: ResolveWorkflowConfigUsecase,
  ) {}

  async execute(
    params: GetCycleIssuesForAssigneeParams,
  ): Promise<GetCycleIssuesForAssigneeResult> {
    const locator = await this.dataGateway.getActiveCycleLocator(params.teamId);

    if (locator === null) {
      return { status: 'no_active_cycle' };
    }

    const workflowConfig = await this.resolveWorkflowConfig.execute({
      teamId: params.teamId,
    });

    const { assigneeName, issues } =
      await this.dataGateway.getCycleIssuesForAssignee(
        params.teamId,
        locator.cycleId,
        params.assigneeName,
        [...workflowConfig.startedStatuses],
        [...workflowConfig.completedStatuses],
      );

    return {
      status: 'ready',
      cycleId: locator.cycleId,
      cycleName: locator.cycleName,
      assigneeName,
      issues,
    };
  }
}
