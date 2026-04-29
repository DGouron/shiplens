import { InvalidCyclePhaseRangeError } from './cycle-phase.errors.js';
import {
  EARLY_PHASE_UPPER_BOUND,
  MID_PHASE_UPPER_BOUND,
  type PhaseLabel,
  TOLERANCE_PERCENTAGE_POINTS,
  type Verdict,
} from './cycle-phase.schema.js';

interface CyclePhaseInput {
  startsAt: Date;
  endsAt: Date;
  now: Date;
}

interface CyclePhaseProps {
  elapsedTimeRatio: number;
  label: PhaseLabel;
}

function computeLabel(
  elapsedTimeRatio: number,
  hasStarted: boolean,
): PhaseLabel {
  if (!hasStarted) {
    return 'not-started';
  }
  if (elapsedTimeRatio >= 1) {
    return 'complete';
  }
  if (elapsedTimeRatio < EARLY_PHASE_UPPER_BOUND) {
    return 'early';
  }
  if (elapsedTimeRatio < MID_PHASE_UPPER_BOUND) {
    return 'mid';
  }
  return 'late';
}

export class CyclePhase {
  private constructor(private readonly props: CyclePhaseProps) {}

  static from(input: CyclePhaseInput): CyclePhase {
    if (input.endsAt.getTime() <= input.startsAt.getTime()) {
      throw new InvalidCyclePhaseRangeError();
    }

    const hasStarted = input.now.getTime() >= input.startsAt.getTime();
    const rawRatio =
      (input.now.getTime() - input.startsAt.getTime()) /
      (input.endsAt.getTime() - input.startsAt.getTime());
    const elapsedTimeRatio = hasStarted ? Math.min(rawRatio, 1) : 0;
    const label = computeLabel(elapsedTimeRatio, hasStarted);

    return new CyclePhase({ elapsedTimeRatio, label });
  }

  get elapsedTimeRatio(): number {
    return this.props.elapsedTimeRatio;
  }

  get label(): PhaseLabel {
    return this.props.label;
  }

  get isStarted(): boolean {
    return this.props.label !== 'not-started';
  }

  get isComplete(): boolean {
    return this.props.label === 'complete';
  }

  expectedCompletionRate(): number {
    return 100 * this.props.elapsedTimeRatio;
  }

  expectedDeliveredPoints(committedPoints: number): number {
    return committedPoints * this.props.elapsedTimeRatio;
  }

  verdict(actualPercentage: number, expectedPercentage: number): Verdict {
    if (this.props.label === 'not-started') {
      return 'not-applicable';
    }
    const difference = actualPercentage - expectedPercentage;
    if (difference > TOLERANCE_PERCENTAGE_POINTS) {
      return 'ahead';
    }
    if (difference < -TOLERANCE_PERCENTAGE_POINTS) {
      return 'behind';
    }
    return 'on-track';
  }
}
