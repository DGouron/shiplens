import { describe, it, expect } from 'vitest';
import { SprintReport } from '@modules/analytics/entities/sprint-report/sprint-report.js';

describe('SprintReport', () => {
  const validProps = {
    id: 'a0000000-0000-4000-8000-000000000001',
    cycleId: 'cycle-1',
    teamId: 'team-1',
    cycleName: 'Sprint 10',
    language: 'FR',
    generatedAt: '2026-01-15T10:00:00.000Z',
    sections: {
      executiveSummary: 'Le sprint s\'est bien déroulé avec une vélocité stable.',
      trends: 'La vélocité est en hausse de 10% par rapport aux 3 derniers sprints.',
      highlights: 'Migration de la base de données terminée en avance.',
      risks: 'Deux issues critiques restent ouvertes.',
      recommendations: 'Prioriser la résolution des issues critiques au prochain sprint.',
    },
  };

  it('creates a sprint report with valid props', () => {
    const report = SprintReport.create(validProps);

    expect(report.cycleId).toBe('cycle-1');
    expect(report.teamId).toBe('team-1');
    expect(report.cycleName).toBe('Sprint 10');
    expect(report.language).toBe('FR');
  });

  it('exposes id getter', () => {
    const report = SprintReport.create(validProps);

    expect(report.id).toBe('a0000000-0000-4000-8000-000000000001');
  });

  it('exposes generatedAt getter', () => {
    const report = SprintReport.create(validProps);

    expect(report.generatedAt).toBe('2026-01-15T10:00:00.000Z');
  });

  it('exposes all report sections', () => {
    const report = SprintReport.create(validProps);

    expect(report.executiveSummary).toBe(validProps.sections.executiveSummary);
    expect(report.trends).toBe(validProps.sections.trends);
    expect(report.highlights).toBe(validProps.sections.highlights);
    expect(report.risks).toBe(validProps.sections.risks);
    expect(report.recommendations).toBe(validProps.sections.recommendations);
  });

  it('accepts null trends when no history is available', () => {
    const report = SprintReport.create({
      ...validProps,
      sections: { ...validProps.sections, trends: null },
    });

    expect(report.trends).toBeNull();
  });

  it('accepts EN language', () => {
    const report = SprintReport.create({ ...validProps, language: 'EN' });

    expect(report.language).toBe('EN');
  });

  it('rejects invalid language', () => {
    expect(() =>
      SprintReport.create({ ...validProps, language: 'JP' }),
    ).toThrow();
  });

  it('rejects invalid uuid', () => {
    expect(() =>
      SprintReport.create({ ...validProps, id: 'not-a-uuid' }),
    ).toThrow();
  });

  it('rejects empty executive summary', () => {
    expect(() =>
      SprintReport.create({
        ...validProps,
        sections: { ...validProps.sections, executiveSummary: '' },
      }),
    ).toThrow();
  });

  it('rejects missing sections', () => {
    expect(() =>
      SprintReport.create({ ...validProps, sections: undefined }),
    ).toThrow();
  });
});
