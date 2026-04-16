import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type WorkflowConfig } from '../../entities/workflow-config/workflow-config.js';
import { type WorkflowConfigSource } from '../../entities/workflow-config/workflow-config.schema.js';

export interface WorkflowConfigDto {
  startedStatuses: readonly string[];
  completedStatuses: readonly string[];
  source: WorkflowConfigSource;
}

@Injectable()
export class WorkflowConfigPresenter
  implements Presenter<WorkflowConfig, WorkflowConfigDto>
{
  present(config: WorkflowConfig): WorkflowConfigDto {
    return {
      startedStatuses: config.startedStatuses,
      completedStatuses: config.completedStatuses,
      source: config.source,
    };
  }
}
