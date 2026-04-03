import { ReportNotFoundError } from '@modules/analytics/entities/sprint-report/sprint-report.errors.js';
import { StubSprintReportGateway } from '@modules/analytics/testing/good-path/stub.sprint-report.gateway.js';
import { GetReportUsecase } from '@modules/analytics/usecases/get-report.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { SprintReportBuilder } from '../../../builders/sprint-report.builder.js';

describe('GetReportUsecase', () => {
  let gateway: StubSprintReportGateway;
  let usecase: GetReportUsecase;

  beforeEach(() => {
    gateway = new StubSprintReportGateway();
    usecase = new GetReportUsecase(gateway);
  });

  it('returns a report by id', async () => {
    const report = new SprintReportBuilder()
      .withId('a0000000-0000-4000-8000-000000000001')
      .withCycleName('Sprint 12')
      .build();

    await gateway.save(report);

    const retrieved = await usecase.execute({
      reportId: 'a0000000-0000-4000-8000-000000000001',
    });

    expect(retrieved.id).toBe('a0000000-0000-4000-8000-000000000001');
    expect(retrieved.cycleName).toBe('Sprint 12');
  });

  it('throws ReportNotFoundError when report does not exist', async () => {
    await expect(
      usecase.execute({ reportId: 'a0000000-0000-4000-8000-999999999999' }),
    ).rejects.toThrow(ReportNotFoundError);
  });
});
