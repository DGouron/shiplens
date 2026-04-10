import { SprintReport } from '@modules/analytics/entities/sprint-report/sprint-report.js';
import { describe, expect, it } from 'vitest';

describe('SprintReport', () => {
  const validProps = {
    id: 'a0000000-0000-4000-8000-000000000001',
    cycleId: 'cycle-1',
    teamId: 'team-1',
    cycleName: 'Sprint 10',
    language: 'FR',
    generatedAt: '2026-01-15T10:00:00.000Z',
    sections: {
      executiveSummary:
        "Le sprint s'est bien déroulé avec une vélocité stable.",
      trends:
        'La vélocité est en hausse de 10% par rapport aux 3 derniers sprints.',
      highlights: 'Migration de la base de données terminée en avance.',
      risks: 'Deux issues critiques restent ouvertes.',
      recommendations:
        'Prioriser la résolution des issues critiques au prochain sprint.',
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

  it('creates a report with null audit section when not provided', () => {
    const report = SprintReport.create(validProps);

    expect(report.auditSection).toBeNull();
  });

  it('creates a report with audit section when provided', () => {
    const report = SprintReport.create({
      ...validProps,
      auditSection: {
        evaluatedRules: [
          {
            ruleName: 'Cycle time max',
            status: 'pass',
            measuredValue: '3 jours',
            threshold: '5 jours',
            recommendation: null,
          },
        ],
        checklistItems: [{ name: 'Code review' }],
        adherenceScore: 100,
        trend: null,
      },
    });

    expect(report.auditSection).not.toBeNull();
    expect(report.auditSection?.adherenceScore).toBe(100);
    expect(report.auditSection?.evaluatedRules).toHaveLength(1);
    expect(report.auditSection?.evaluatedRules[0].ruleName).toBe(
      'Cycle time max',
    );
    expect(report.auditSection?.checklistItems).toHaveLength(1);
    expect(report.auditSection?.trend).toBeNull();
  });

  it('creates a report with audit section including trend', () => {
    const report = SprintReport.create({
      ...validProps,
      auditSection: {
        evaluatedRules: [],
        checklistItems: [],
        adherenceScore: 80,
        trend: {
          scores: [60, 70, 75],
          message: '60% → 70% → 75% → 80%',
        },
      },
    });

    expect(report.auditSection?.trend?.scores).toEqual([60, 70, 75]);
    expect(report.auditSection?.trend?.message).toBe('60% → 70% → 75% → 80%');
  });
});
