import {
  type CycleSummaryResponse,
  type TeamCyclesResponse,
} from '@/modules/analytics/entities/team-cycles/team-cycles.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';
import { CycleSummaryResponseBuilder } from './cycle-summary-response.builder.ts';

export class TeamCyclesResponseBuilder extends EntityBuilder<
  TeamCyclesResponse,
  TeamCyclesResponse
> {
  constructor() {
    super({
      cycles: [new CycleSummaryResponseBuilder().build()],
    });
  }

  withCycles(cycles: CycleSummaryResponse[]): this {
    this.props.cycles = cycles;
    return this;
  }

  build(): TeamCyclesResponse {
    return { cycles: this.props.cycles.map((cycle) => ({ ...cycle })) };
  }
}
