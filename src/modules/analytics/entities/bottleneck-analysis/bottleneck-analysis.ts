import { NoCompletedIssuesError } from './bottleneck-analysis.errors.js';
import { bottleneckAnalysisGuard } from './bottleneck-analysis.guard.js';
import {
  type BottleneckAnalysisProps,
  type CompletedIssue,
} from './bottleneck-analysis.schema.js';

const MILLISECONDS_PER_HOUR = 1000 * 60 * 60;

interface StatusMedian {
  statusName: string;
  medianHours: number;
}

interface AssigneeBreakdownEntry {
  assigneeName: string;
  statusMedians: StatusMedian[];
}

interface CycleComparisonEntry {
  statusName: string;
  previousMedianHours: number;
  currentMedianHours: number;
  evolutionPercent: number;
}

function hoursBetween(from: string, to: string): number {
  return (
    (new Date(to).getTime() - new Date(from).getTime()) / MILLISECONDS_PER_HOUR
  );
}

function computeMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

function computeTimePerStatus(issue: CompletedIssue): Map<string, number> {
  const timePerStatus = new Map<string, number>();
  const transitions = issue.transitions;

  for (let index = 0; index < transitions.length - 1; index++) {
    const current = transitions[index];
    const next = transitions[index + 1];
    const hours = hoursBetween(current.occurredAt, next.occurredAt);
    const existing = timePerStatus.get(current.toStatusName) ?? 0;
    timePerStatus.set(current.toStatusName, existing + hours);
  }

  return timePerStatus;
}

function computeMediansByStatus(issues: CompletedIssue[]): Map<string, number> {
  const timesByStatus = new Map<string, number[]>();

  for (const issue of issues) {
    const timePerStatus = computeTimePerStatus(issue);
    for (const [status, hours] of timePerStatus) {
      const existing = timesByStatus.get(status) ?? [];
      existing.push(hours);
      timesByStatus.set(status, existing);
    }
  }

  const medians = new Map<string, number>();
  for (const [status, hours] of timesByStatus) {
    medians.set(status, computeMedian(hours));
  }

  return medians;
}

export class BottleneckAnalysis {
  private constructor(private readonly props: BottleneckAnalysisProps) {}

  static create(props: unknown): BottleneckAnalysis {
    const validated = bottleneckAnalysisGuard.parse(props);

    if (validated.completedIssues.length === 0) {
      throw new NoCompletedIssuesError();
    }

    return new BottleneckAnalysis(validated);
  }

  get statusDistribution(): StatusMedian[] {
    const medians = computeMediansByStatus(this.props.completedIssues);
    return [...medians.entries()].map(([statusName, medianHours]) => ({
      statusName,
      medianHours,
    }));
  }

  get bottleneckStatus(): string {
    const distribution = this.statusDistribution;
    let maxMedian = 0;
    let bottleneck = '';

    for (const entry of distribution) {
      if (entry.medianHours > maxMedian) {
        maxMedian = entry.medianHours;
        bottleneck = entry.statusName;
      }
    }

    return bottleneck;
  }

  get assigneeBreakdown(): AssigneeBreakdownEntry[] {
    const issuesByAssignee = new Map<string, CompletedIssue[]>();

    for (const issue of this.props.completedIssues) {
      if (issue.assigneeName === null) continue;
      const existing = issuesByAssignee.get(issue.assigneeName) ?? [];
      existing.push(issue);
      issuesByAssignee.set(issue.assigneeName, existing);
    }

    return [...issuesByAssignee.entries()].map(([assigneeName, issues]) => {
      const medians = computeMediansByStatus(issues);
      return {
        assigneeName,
        statusMedians: [...medians.entries()].map(
          ([statusName, medianHours]) => ({
            statusName,
            medianHours,
          }),
        ),
      };
    });
  }

  get cycleComparison(): CycleComparisonEntry[] | null {
    if (!this.props.previousCycleMedians) return null;

    const currentMedians = computeMediansByStatus(this.props.completedIssues);
    const entries: CycleComparisonEntry[] = [];

    for (const [statusName, previousMedianHours] of Object.entries(
      this.props.previousCycleMedians,
    )) {
      const currentMedianHours = currentMedians.get(statusName) ?? 0;
      const evolutionPercent =
        previousMedianHours === 0
          ? 0
          : Math.round(
              ((currentMedianHours - previousMedianHours) /
                previousMedianHours) *
                100,
            );

      entries.push({
        statusName,
        previousMedianHours,
        currentMedianHours,
        evolutionPercent,
      });
    }

    return entries;
  }

  get mediansAsRecord(): Record<string, number> {
    const medians = computeMediansByStatus(this.props.completedIssues);
    const record: Record<string, number> = {};
    for (const [status, median] of medians) {
      record[status] = median;
    }
    return record;
  }
}
