import { type SynchronizationDto } from '@/modules/analytics/entities/workspace-dashboard/workspace-dashboard.dto.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

export class SynchronizationDtoBuilder extends EntityBuilder<
  SynchronizationDto,
  SynchronizationDto
> {
  constructor() {
    super({
      lastSyncDate: '2026-04-15T08:00:00.000Z',
      isLate: false,
      lateWarning: null,
      nextSync: 'daily',
    });
  }

  withLastSyncDate(lastSyncDate: string | null): this {
    this.props.lastSyncDate = lastSyncDate;
    return this;
  }

  withIsLate(isLate: boolean): this {
    this.props.isLate = isLate;
    return this;
  }

  withLateWarning(lateWarning: string | null): this {
    this.props.lateWarning = lateWarning;
    return this;
  }

  build(): SynchronizationDto {
    return { ...this.props };
  }
}
