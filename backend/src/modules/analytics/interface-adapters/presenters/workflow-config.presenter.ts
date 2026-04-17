import { Injectable } from '@nestjs/common';
import { type WorkflowConfig } from '../../entities/workflow-config/workflow-config.js';
import { type WorkflowConfigSource } from '../../entities/workflow-config/workflow-config.schema.js';

export interface WorkflowConfigDto {
  startedStatuses: readonly string[];
  completedStatuses: readonly string[];
  source: WorkflowConfigSource;
  knownStatuses: readonly string[];
}

@Injectable()
export class WorkflowConfigPresenter {
  present(
    config: WorkflowConfig,
    knownStatuses: readonly string[],
  ): WorkflowConfigDto {
    return {
      startedStatuses: config.startedStatuses,
      completedStatuses: config.completedStatuses,
      source: config.source,
      knownStatuses,
    };
  }
}
