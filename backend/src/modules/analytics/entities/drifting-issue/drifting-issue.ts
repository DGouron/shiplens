import { calculateBusinessHours } from './business-hours.js';
import { getMaxBusinessHours, requiresSplitting } from './drift-grid.js';
import { driftingIssueInputGuard } from './drifting-issue.guard.js';
import { type DriftingIssueInput } from './drifting-issue.schema.js';

export type DriftStatus = 'drifting' | 'needs-splitting' | 'on-track';

export class DriftingIssue {
  private constructor(
    private readonly input: DriftingIssueInput,
    private readonly elapsedHours: number,
    private readonly maxHours: number | null,
    private readonly status: DriftStatus,
  ) {}

  static analyze(
    rawInput: unknown,
    now: string,
    timezone: string,
  ): DriftingIssue | null {
    const input = driftingIssueInputGuard.parse(rawInput);

    if (input.points === null) return null;
    if (input.statusType === 'completed' || input.statusType === 'canceled')
      return null;

    if (requiresSplitting(input.points)) {
      return new DriftingIssue(input, 0, null, 'needs-splitting');
    }

    if (input.startedAt === null) return null;

    const maxHours = getMaxBusinessHours(input.points);
    if (maxHours === null) return null;

    const elapsedHours = calculateBusinessHours(input.startedAt, now, timezone);

    const status: DriftStatus =
      elapsedHours > maxHours ? 'drifting' : 'on-track';

    return new DriftingIssue(input, elapsedHours, maxHours, status);
  }

  get issueExternalId(): string {
    return this.input.issueExternalId;
  }

  get issueTitle(): string {
    return this.input.issueTitle;
  }

  get issueUuid(): string {
    return this.input.issueUuid;
  }

  get teamId(): string {
    return this.input.teamId;
  }

  get points(): number | null {
    return this.input.points;
  }

  get statusName(): string {
    return this.input.statusName;
  }

  get assigneeName(): string | null {
    return this.input.assigneeName;
  }

  get driftStatus(): DriftStatus {
    return this.status;
  }

  get elapsedBusinessHours(): number {
    return this.elapsedHours;
  }

  get expectedMaxHours(): number | null {
    return this.maxHours;
  }

  get isDrifting(): boolean {
    return this.status === 'drifting';
  }

  get needsSplitting(): boolean {
    return this.status === 'needs-splitting';
  }

  get isAlert(): boolean {
    return this.isDrifting || this.needsSplitting;
  }
}
