import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import {
  type CycleProjectIssueDetail,
  NO_PROJECT_BUCKET_ID,
} from '../entities/top-cycle-projects/top-cycle-projects.schema.js';
import { TopCycleProjectsDataGateway } from '../entities/top-cycle-projects/top-cycle-projects-data.gateway.js';

interface GetCycleIssuesForProjectParams {
  teamId: string;
  projectId: string;
}

type GetCycleIssuesForProjectResult =
  | { status: 'no_active_cycle' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      projectExternalId: string | null;
      projectName: string | null;
      issues: CycleProjectIssueDetail[];
    };

@Injectable()
export class GetCycleIssuesForProjectUsecase
  implements
    Usecase<GetCycleIssuesForProjectParams, GetCycleIssuesForProjectResult>
{
  constructor(private readonly dataGateway: TopCycleProjectsDataGateway) {}

  async execute(
    params: GetCycleIssuesForProjectParams,
  ): Promise<GetCycleIssuesForProjectResult> {
    const locator = await this.dataGateway.getActiveCycleLocator(params.teamId);

    if (locator === null) {
      return { status: 'no_active_cycle' };
    }

    const projectExternalIdOrNull =
      params.projectId === NO_PROJECT_BUCKET_ID ? null : params.projectId;

    const { projectName, issues } =
      await this.dataGateway.getCycleIssuesForProject(
        params.teamId,
        locator.cycleId,
        projectExternalIdOrNull,
      );

    return {
      status: 'ready',
      cycleId: locator.cycleId,
      cycleName: locator.cycleName,
      projectExternalId: projectExternalIdOrNull,
      projectName,
      issues,
    };
  }
}
