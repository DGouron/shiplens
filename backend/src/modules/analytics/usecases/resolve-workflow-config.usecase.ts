import { Injectable, Logger } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { AvailableStatusesGateway } from '../entities/team-settings/available-statuses.gateway.js';
import { WorkflowConfigGateway } from '../entities/workflow-config/workflow-config.gateway.js';
import { WorkflowConfig } from '../entities/workflow-config/workflow-config.js';
import {
  FALLBACK_COMPLETED_STATUSES,
  FALLBACK_STARTED_STATUSES,
  matchCompletedStatuses,
  matchStartedStatuses,
} from '../entities/workflow-config/workflow-status-patterns.js';

interface ResolveWorkflowConfigParams {
  teamId: string;
}

@Injectable()
export class ResolveWorkflowConfigUsecase
  implements Usecase<ResolveWorkflowConfigParams, WorkflowConfig>
{
  private readonly logger = new Logger(ResolveWorkflowConfigUsecase.name);

  constructor(
    private readonly workflowConfigGateway: WorkflowConfigGateway,
    private readonly availableStatusesGateway: AvailableStatusesGateway,
  ) {}

  async execute(params: ResolveWorkflowConfigParams): Promise<WorkflowConfig> {
    const existing = await this.workflowConfigGateway.findByTeamId(
      params.teamId,
    );

    if (existing) {
      this.logger.log(
        `[${params.teamId}] Workflow config found — source: ${existing.source}`,
      );
      return existing;
    }

    const transitionStatuses =
      await this.availableStatusesGateway.getDistinctTransitionStatusNames(
        params.teamId,
      );

    const matchedStarted = matchStartedStatuses(transitionStatuses);
    const matchedCompleted = matchCompletedStatuses(transitionStatuses);

    const hasMatches = matchedStarted.length > 0 || matchedCompleted.length > 0;

    const startedStatuses = hasMatches
      ? matchedStarted
      : [...FALLBACK_STARTED_STATUSES];
    const completedStatuses = hasMatches
      ? matchedCompleted
      : [...FALLBACK_COMPLETED_STATUSES];

    const config = WorkflowConfig.create({
      startedStatuses,
      completedStatuses,
      source: 'auto-detected',
    });

    await this.workflowConfigGateway.save(params.teamId, config);

    this.logger.log(
      `[${params.teamId}] Workflow config auto-detected — started: [${startedStatuses.join(', ')}], completed: [${completedStatuses.join(', ')}]`,
    );

    return config;
  }
}
