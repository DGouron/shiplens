import { NegativeThresholdError } from './status-threshold.errors.js';
import { statusThresholdGuard } from './status-threshold.guard.js';
import { type StatusThresholdProps } from './status-threshold.schema.js';

export type AlertSeverity = 'warning' | 'critical';

const DEFAULT_THRESHOLDS: Array<{
  statusName: string;
  thresholdHours: number;
}> = [
  { statusName: 'In Progress', thresholdHours: 48 },
  { statusName: 'In Review', thresholdHours: 48 },
  { statusName: 'Todo', thresholdHours: 72 },
];

export class StatusThreshold {
  private constructor(private readonly props: StatusThresholdProps) {}

  static create(props: unknown): StatusThreshold {
    const validated = statusThresholdGuard.parse(props);

    if (validated.thresholdHours <= 0) {
      throw new NegativeThresholdError();
    }

    return new StatusThreshold(validated);
  }

  static defaults(): StatusThreshold[] {
    return DEFAULT_THRESHOLDS.map((entry, index) =>
      StatusThreshold.create({
        id: `default-${index}`,
        statusName: entry.statusName,
        thresholdHours: entry.thresholdHours,
      }),
    );
  }

  get id(): string {
    return this.props.id;
  }

  get statusName(): string {
    return this.props.statusName;
  }

  get thresholdHours(): number {
    return this.props.thresholdHours;
  }

  computeSeverity(durationHours: number): AlertSeverity | null {
    if (durationHours >= this.props.thresholdHours * 2) {
      return 'critical';
    }
    if (durationHours >= this.props.thresholdHours) {
      return 'warning';
    }
    return null;
  }
}
