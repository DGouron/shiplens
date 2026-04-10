import { syncProgressGuard } from './sync-progress.guard.js';
import { type SyncProgressProps } from './sync-progress.schema.js';

export class SyncProgress {
  private constructor(private readonly props: SyncProgressProps) {}

  static create(props: unknown): SyncProgress {
    const validatedProps = syncProgressGuard.parse(props);
    return new SyncProgress(validatedProps);
  }

  get teamId(): string {
    return this.props.teamId;
  }

  get totalIssues(): number {
    return this.props.totalIssues;
  }

  get syncedIssues(): number {
    return this.props.syncedIssues;
  }

  get status(): string {
    return this.props.status;
  }

  get cursor(): string | null {
    return this.props.cursor;
  }

  get progressPercentage(): number {
    if (this.props.totalIssues === 0) {
      return 100;
    }
    return Math.round((this.props.syncedIssues / this.props.totalIssues) * 100);
  }

  get canResume(): boolean {
    return this.props.status === 'failed';
  }

  advance(additionalIssues: number, newCursor: string | null): SyncProgress {
    return new SyncProgress({
      ...this.props,
      syncedIssues: this.props.syncedIssues + additionalIssues,
      cursor: newCursor,
    });
  }

  complete(): SyncProgress {
    return new SyncProgress({
      ...this.props,
      status: 'completed',
      syncedIssues: this.props.totalIssues,
    });
  }

  fail(): SyncProgress {
    return new SyncProgress({
      ...this.props,
      status: 'failed',
    });
  }
}
