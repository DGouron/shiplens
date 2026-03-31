import { describe, it, expect, beforeEach } from 'vitest';
import { GenerateSprintReportUsecase } from '@modules/analytics/usecases/generate-sprint-report.usecase.js';
import { StubSprintReportDataGateway } from '@modules/analytics/testing/good-path/stub.sprint-report-data.gateway.js';
import { StubAiTextGeneratorGateway } from '@modules/analytics/testing/good-path/stub.ai-text-generator.gateway.js';
import { SprintNotSynchronizedError } from '@modules/analytics/entities/sprint-report/sprint-report.errors.js';
import { EmptySprintError } from '@modules/analytics/entities/sprint-report/sprint-report.errors.js';
import { UnsupportedLanguageError } from '@modules/analytics/entities/sprint-report/sprint-report.errors.js';
import { AiProviderUnavailableError } from '@modules/analytics/entities/sprint-report/sprint-report.errors.js';
import { FailingAiTextGeneratorGateway } from '@modules/analytics/testing/bad-path/failing.ai-text-generator.gateway.js';

describe('GenerateSprintReportUsecase', () => {
  let dataGateway: StubSprintReportDataGateway;
  let aiGateway: StubAiTextGeneratorGateway;
  let usecase: GenerateSprintReportUsecase;

  beforeEach(() => {
    dataGateway = new StubSprintReportDataGateway();
    aiGateway = new StubAiTextGeneratorGateway();
    usecase = new GenerateSprintReportUsecase(dataGateway, aiGateway);
  });

  it('generates a report in french for a synchronized sprint', async () => {
    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(report.cycleId).toBe('cycle-1');
    expect(report.language).toBe('FR');
    expect(report.executiveSummary).toBeTruthy();
    expect(report.highlights).toBeTruthy();
    expect(report.risks).toBeTruthy();
    expect(report.recommendations).toBeTruthy();
  });

  it('generates a report in english', async () => {
    aiGateway.generatedText = JSON.stringify({
      executiveSummary: 'The sprint went well with stable velocity.',
      trends: 'Velocity increased by 10% compared to last 3 sprints.',
      highlights: 'Database migration completed ahead of schedule.',
      risks: 'Two critical issues remain open.',
      recommendations: 'Prioritize critical issue resolution next sprint.',
    });

    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'EN',
      provider: 'Anthropic',
    });

    expect(report.language).toBe('EN');
    expect(aiGateway.receivedProvider).toBe('Anthropic');
  });

  it('passes the correct provider to the AI gateway', async () => {
    await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'Ollama',
    });

    expect(aiGateway.receivedProvider).toBe('Ollama');
  });

  it('throws SprintNotSynchronizedError when sprint is not synchronized', async () => {
    dataGateway.synchronized = false;

    await expect(
      usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'FR',
        provider: 'OpenAI',
      }),
    ).rejects.toThrow(SprintNotSynchronizedError);
  });

  it('throws EmptySprintError when sprint has no issues', async () => {
    dataGateway.sprintContext = {
      ...dataGateway.sprintContext,
      issues: [],
    };

    await expect(
      usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'FR',
        provider: 'OpenAI',
      }),
    ).rejects.toThrow(EmptySprintError);
  });

  it('throws UnsupportedLanguageError for unsupported language', async () => {
    await expect(
      usecase.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'JP' as 'FR',
        provider: 'OpenAI',
      }),
    ).rejects.toThrow(UnsupportedLanguageError);
  });

  it('throws AiProviderUnavailableError when provider is unavailable', async () => {
    const failingAiGateway = new FailingAiTextGeneratorGateway();
    const usecaseWithFailing = new GenerateSprintReportUsecase(
      dataGateway,
      failingAiGateway,
    );

    await expect(
      usecaseWithFailing.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'FR',
        provider: 'OpenAI',
      }),
    ).rejects.toThrow(AiProviderUnavailableError);
  });

  it('generates report without trends when no history is available', async () => {
    dataGateway.trendContext = null;

    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(report.trends).toBeNull();
  });

  it('includes trends when history is available', async () => {
    dataGateway.trendContext = { previousVelocities: [18, 20, 22] };

    aiGateway.generatedText = JSON.stringify({
      executiveSummary: 'Le sprint s\'est bien déroulé.',
      trends: 'La vélocité est en hausse.',
      highlights: 'Bonne progression.',
      risks: 'Aucun risque majeur.',
      recommendations: 'Continuer sur cette lancée.',
    });

    const report = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(report.trends).toBeTruthy();
  });

  it('includes sprint context in the prompt sent to AI', async () => {
    await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(aiGateway.receivedPrompt).toContain('Sprint 10');
    expect(aiGateway.receivedPrompt).toContain('cycle-1');
  });
});
