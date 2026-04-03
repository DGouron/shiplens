import { StubSprintReportGateway } from '@modules/analytics/testing/good-path/stub.sprint-report.gateway.js';
import { ListTeamReportsUsecase } from '@modules/analytics/usecases/list-team-reports.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { SprintReportBuilder } from '../../../builders/sprint-report.builder.js';

describe('ListTeamReportsUsecase', () => {
  let gateway: StubSprintReportGateway;
  let usecase: ListTeamReportsUsecase;

  beforeEach(() => {
    gateway = new StubSprintReportGateway();
    usecase = new ListTeamReportsUsecase(gateway);
  });

  it('returns reports sorted by generatedAt descending', async () => {
    const older = new SprintReportBuilder()
      .withId('a0000000-0000-4000-8000-000000000001')
      .withCycleName('Sprint 10')
      .withGeneratedAt('2026-01-01T10:00:00.000Z')
      .build();
    const newer = new SprintReportBuilder()
      .withId('a0000000-0000-4000-8000-000000000002')
      .withCycleName('Sprint 11')
      .withGeneratedAt('2026-01-15T10:00:00.000Z')
      .build();

    await gateway.save(older);
    await gateway.save(newer);

    const reports = await usecase.execute({ teamId: 'team-1' });

    expect(reports).toHaveLength(2);
    expect(reports[0].cycleName).toBe('Sprint 11');
    expect(reports[1].cycleName).toBe('Sprint 10');
  });

  it('returns empty array when no reports exist', async () => {
    const reports = await usecase.execute({ teamId: 'team-1' });

    expect(reports).toHaveLength(0);
  });
});
