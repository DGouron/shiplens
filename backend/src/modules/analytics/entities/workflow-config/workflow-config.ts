import { workflowConfigGuard } from './workflow-config.guard.js';
import {
  type WorkflowConfigProps,
  type WorkflowConfigSource,
} from './workflow-config.schema.js';

export class WorkflowConfig {
  private constructor(private readonly props: WorkflowConfigProps) {}

  static create(props: unknown): WorkflowConfig {
    const validated = workflowConfigGuard.parse(props);
    return new WorkflowConfig(validated);
  }

  get startedStatuses(): readonly string[] {
    return this.props.startedStatuses;
  }

  get completedStatuses(): readonly string[] {
    return this.props.completedStatuses;
  }

  get source(): WorkflowConfigSource {
    return this.props.source;
  }
}
