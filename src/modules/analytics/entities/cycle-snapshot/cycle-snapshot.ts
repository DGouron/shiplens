import {
  CycleNotCompletedError,
  NoCycleIssuesError,
} from './cycle-snapshot.errors.js';
import { cycleSnapshotGuard } from './cycle-snapshot.guard.js';
import {
  type CycleIssue,
  type CycleSnapshotProps,
} from './cycle-snapshot.schema.js';

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

function daysBetween(fromDate: string, toDate: string): number {
  return (
    (new Date(toDate).getTime() - new Date(fromDate).getTime()) /
    MILLISECONDS_PER_DAY
  );
}

export class CycleSnapshot {
  private constructor(private readonly props: CycleSnapshotProps) {}

  static create(props: unknown): CycleSnapshot {
    const validatedProps = cycleSnapshotGuard.parse(props);

    if (new Date(validatedProps.endsAt) > new Date()) {
      throw new CycleNotCompletedError();
    }

    if (validatedProps.issues.length === 0) {
      throw new NoCycleIssuesError();
    }

    return new CycleSnapshot(validatedProps);
  }

  get cycleId(): string {
    return this.props.cycleId;
  }

  get teamId(): string {
    return this.props.teamId;
  }

  get cycleName(): string {
    return this.props.cycleName;
  }

  get startsAt(): string {
    return this.props.startsAt;
  }

  get endsAt(): string {
    return this.props.endsAt;
  }

  get issues(): readonly CycleIssue[] {
    return this.props.issues;
  }

  get completedIssues(): CycleIssue[] {
    return this.props.issues.filter((issue) => issue.completedAt !== null);
  }

  get initialIssues(): CycleIssue[] {
    const cycleStart = new Date(this.props.startsAt);
    return this.props.issues.filter(
      (issue) => new Date(issue.createdAt) <= cycleStart,
    );
  }

  get completedPoints(): number {
    return this.completedIssues.reduce(
      (sum, issue) => sum + (issue.points ?? 0),
      0,
    );
  }

  get plannedPoints(): number {
    return this.props.issues.reduce(
      (sum, issue) => sum + (issue.points ?? 0),
      0,
    );
  }

  get throughput(): number {
    return this.completedIssues.length;
  }

  get completionRate(): number {
    const initialCount = this.initialIssues.length;
    if (initialCount === 0) {
      return 0;
    }
    const completedInitial = this.initialIssues.filter(
      (issue) => issue.completedAt !== null,
    ).length;
    return Math.round((completedInitial / initialCount) * 100);
  }

  get scopeCreep(): number {
    const cycleStart = new Date(this.props.startsAt);
    return this.props.issues.filter(
      (issue) => new Date(issue.createdAt) > cycleStart,
    ).length;
  }

  get averageCycleTimeInDays(): number | null {
    const issuesWithCycleTime = this.completedIssues.filter(
      (
        issue,
      ): issue is CycleIssue & { startedAt: string; completedAt: string } =>
        issue.startedAt !== null && issue.completedAt !== null,
    );

    if (issuesWithCycleTime.length === 0) {
      return null;
    }

    const totalDays = issuesWithCycleTime.reduce(
      (sum, issue) => sum + daysBetween(issue.startedAt, issue.completedAt),
      0,
    );

    return totalDays / issuesWithCycleTime.length;
  }

  get averageLeadTimeInDays(): number | null {
    const issuesWithLeadTime = this.props.issues.filter(
      (issue): issue is CycleIssue & { completedAt: string } =>
        issue.completedAt !== null,
    );

    if (issuesWithLeadTime.length === 0) {
      return null;
    }

    const totalDays = issuesWithLeadTime.reduce(
      (sum, issue) => sum + daysBetween(issue.createdAt, issue.completedAt),
      0,
    );

    return totalDays / issuesWithLeadTime.length;
  }
}
