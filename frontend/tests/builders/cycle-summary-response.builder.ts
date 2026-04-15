import { type CycleSummaryResponse } from '@/modules/analytics/entities/team-cycles/team-cycles.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class CycleSummaryResponseBuilder extends EntityBuilder<
  CycleSummaryResponse,
  CycleSummaryResponse
> {
  constructor() {
    super({
      externalId: 'cycle-1',
      name: 'Cycle 12',
      startsAt: '2026-04-01T00:00:00.000Z',
      endsAt: '2026-04-14T23:59:59.999Z',
      issueCount: 10,
      status: 'in_progress',
    });
  }

  withExternalId(externalId: string): this {
    this.props.externalId = externalId;
    return this;
  }

  withName(name: string): this {
    this.props.name = name;
    return this;
  }

  withStartsAt(startsAt: string): this {
    this.props.startsAt = startsAt;
    return this;
  }

  withEndsAt(endsAt: string): this {
    this.props.endsAt = endsAt;
    return this;
  }

  withIssueCount(issueCount: number): this {
    this.props.issueCount = issueCount;
    return this;
  }

  withStatus(status: CycleSummaryResponse['status']): this {
    this.props.status = status;
    return this;
  }

  build(): CycleSummaryResponse {
    return { ...this.props };
  }
}
