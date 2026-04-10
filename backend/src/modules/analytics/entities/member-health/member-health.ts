import {
  computeHealthSignal,
  type HealthSignalResult,
} from './health-signal.js';
import { memberHealthGuard } from './member-health.guard.js';
import { type MemberHealthProps } from './member-health.schema.js';

export class MemberHealth {
  private constructor(private readonly props: MemberHealthProps) {}

  static create(props: unknown): MemberHealth {
    const validatedProps = memberHealthGuard.parse(props);
    return new MemberHealth(validatedProps);
  }

  get teamId(): string {
    return this.props.teamId;
  }

  get memberName(): string {
    return this.props.memberName;
  }

  estimationScoreSignal(): HealthSignalResult {
    return computeHealthSignal({
      values: this.props.cycleSnapshots.map(
        (snapshot) => snapshot.estimationScorePercent,
      ),
      favorableDirection: 'rising',
      epsilon: { kind: 'absolute', amount: 1 },
    });
  }

  underestimationRatioSignal(): HealthSignalResult {
    return computeHealthSignal({
      values: this.props.cycleSnapshots.map(
        (snapshot) => snapshot.underestimationRatioPercent,
      ),
      favorableDirection: 'falling',
      epsilon: { kind: 'absolute', amount: 1 },
    });
  }

  averageCycleTimeSignal(): HealthSignalResult {
    return computeHealthSignal({
      values: this.props.cycleSnapshots.map(
        (snapshot) => snapshot.averageCycleTimeInDays,
      ),
      favorableDirection: 'falling',
      epsilon: { kind: 'relative', amount: 0.05 },
    });
  }

  driftingTicketsSignal(): HealthSignalResult {
    return computeHealthSignal({
      values: this.props.cycleSnapshots.map(
        (snapshot) => snapshot.driftingTicketCount,
      ),
      favorableDirection: 'falling',
      epsilon: { kind: 'absolute', amount: 0 },
    });
  }

  medianReviewTimeSignal(): HealthSignalResult {
    return computeHealthSignal({
      values: this.props.cycleSnapshots.map(
        (snapshot) => snapshot.medianReviewTimeInHours,
      ),
      favorableDirection: 'falling',
      epsilon: { kind: 'relative', amount: 0.05 },
    });
  }
}
