import { CyclePhase } from '@shared/domain/cycle-phase/cycle-phase.js';
import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_STARTS_AT = new Date('2026-01-01T00:00:00Z');
const DEFAULT_CYCLE_DURATION_DAYS = 14;
const DEFAULT_DAY_OF_CYCLE = 7;

interface CyclePhaseBuilderProps {
  startsAt: Date;
  endsAt: Date;
  now: Date;
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * MILLISECONDS_PER_DAY);
}

const defaultProps: CyclePhaseBuilderProps = {
  startsAt: DEFAULT_STARTS_AT,
  endsAt: addDays(DEFAULT_STARTS_AT, DEFAULT_CYCLE_DURATION_DAYS),
  now: addDays(DEFAULT_STARTS_AT, DEFAULT_DAY_OF_CYCLE),
};

export class CyclePhaseBuilder extends EntityBuilder<
  CyclePhaseBuilderProps,
  CyclePhase
> {
  constructor() {
    super(defaultProps);
  }

  withStartsAt(startsAt: Date): this {
    this.props.startsAt = startsAt;
    return this;
  }

  withEndsAt(endsAt: Date): this {
    this.props.endsAt = endsAt;
    return this;
  }

  withNow(now: Date): this {
    this.props.now = now;
    return this;
  }

  withCycleDurationDays(days: number): this {
    this.props.endsAt = addDays(this.props.startsAt, days);
    return this;
  }

  withDayOfCycle(day: number): this {
    this.props.now = addDays(this.props.startsAt, day);
    return this;
  }

  build(): CyclePhase {
    return CyclePhase.from({
      startsAt: this.props.startsAt,
      endsAt: this.props.endsAt,
      now: this.props.now,
    });
  }
}
