import { type EstimationAccuracyProps } from './estimation-accuracy.schema.js';
import { estimationAccuracyGuard } from './estimation-accuracy.guard.js';

type EstimationClassification = 'over-estimated' | 'under-estimated' | 'well-estimated';

export interface IssueRatio {
  externalId: string;
  title: string;
  points: number;
  cycleTimeInDays: number;
  ratio: number;
  classification: EstimationClassification;
}

export interface DeveloperScore {
  developerName: string;
  issueCount: number;
  averageRatio: number;
  classification: EstimationClassification;
}

export interface LabelScore {
  labelName: string;
  issueCount: number;
  averageRatio: number;
  classification: EstimationClassification;
}

export interface TeamScore {
  issueCount: number;
  averageRatio: number;
  classification: EstimationClassification;
}

function classify(ratio: number): EstimationClassification {
  if (ratio > 2.0) return 'over-estimated';
  if (ratio < 0.5) return 'under-estimated';
  return 'well-estimated';
}

function averageRatioFromIssues(issues: ReadonlyArray<{ points: number; cycleTimeInDays: number }>): number {
  if (issues.length === 0) return 0;
  const totalRatio = issues.reduce((sum, issue) => sum + issue.points / issue.cycleTimeInDays, 0);
  return totalRatio / issues.length;
}

export class EstimationAccuracy {
  private constructor(private readonly props: EstimationAccuracyProps) {}

  static create(props: unknown): EstimationAccuracy {
    const validatedProps = estimationAccuracyGuard.parse(props);
    return new EstimationAccuracy(validatedProps);
  }

  get cycleId(): string {
    return this.props.cycleId;
  }

  get excludedWithoutEstimation(): number {
    return this.props.excludedWithoutEstimation;
  }

  get excludedWithoutCycleTime(): number {
    return this.props.excludedWithoutCycleTime;
  }

  ratioPerIssue(): IssueRatio[] {
    return this.props.issues.map((issue) => {
      const ratio = issue.points / issue.cycleTimeInDays;
      return {
        externalId: issue.externalId,
        title: issue.title,
        points: issue.points,
        cycleTimeInDays: issue.cycleTimeInDays,
        ratio,
        classification: classify(ratio),
      };
    });
  }

  scoreByDeveloper(): DeveloperScore[] {
    const grouped = new Map<string, Array<{ points: number; cycleTimeInDays: number }>>();

    for (const issue of this.props.issues) {
      if (issue.assigneeName === null) continue;
      const existing = grouped.get(issue.assigneeName) ?? [];
      existing.push(issue);
      grouped.set(issue.assigneeName, existing);
    }

    return Array.from(grouped.entries()).map(([developerName, issues]) => {
      const average = averageRatioFromIssues(issues);
      return {
        developerName,
        issueCount: issues.length,
        averageRatio: average,
        classification: classify(average),
      };
    });
  }

  scoreByLabel(): LabelScore[] {
    const grouped = new Map<string, Array<{ points: number; cycleTimeInDays: number }>>();

    for (const issue of this.props.issues) {
      for (const labelName of issue.labelNames) {
        const existing = grouped.get(labelName) ?? [];
        existing.push(issue);
        grouped.set(labelName, existing);
      }
    }

    return Array.from(grouped.entries()).map(([labelName, issues]) => {
      const average = averageRatioFromIssues(issues);
      return {
        labelName,
        issueCount: issues.length,
        averageRatio: average,
        classification: classify(average),
      };
    });
  }

  teamScore(): TeamScore {
    const average = averageRatioFromIssues(this.props.issues);
    return {
      issueCount: this.props.issues.length,
      averageRatio: average,
      classification: classify(average),
    };
  }
}
