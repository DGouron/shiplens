import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';
import { SyncProgress } from '@modules/synchronization/entities/sync-progress/sync-progress.js';
import { type SyncProgressProps } from '@modules/synchronization/entities/sync-progress/sync-progress.schema.js';

const defaultProps: SyncProgressProps = {
  teamId: 'team-1',
  totalIssues: 150,
  syncedIssues: 0,
  status: 'in_progress',
  cursor: null,
};

export class SyncProgressBuilder extends EntityBuilder<
  SyncProgressProps,
  SyncProgress
> {
  constructor() {
    super(defaultProps);
  }

  withTeamId(teamId: string): this {
    this.props.teamId = teamId;
    return this;
  }

  withTotalIssues(totalIssues: number): this {
    this.props.totalIssues = totalIssues;
    return this;
  }

  withSyncedIssues(syncedIssues: number): this {
    this.props.syncedIssues = syncedIssues;
    return this;
  }

  withStatus(status: 'in_progress' | 'completed' | 'failed'): this {
    this.props.status = status;
    return this;
  }

  withCursor(cursor: string | null): this {
    this.props.cursor = cursor;
    return this;
  }

  build(): SyncProgress {
    return SyncProgress.create({ ...this.props });
  }
}
