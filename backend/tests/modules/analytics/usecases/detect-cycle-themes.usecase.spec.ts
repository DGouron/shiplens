import { FailingAiTextGeneratorGateway } from '@modules/analytics/testing/bad-path/failing.ai-text-generator.gateway.js';
import { StubAiTextGeneratorGateway } from '@modules/analytics/testing/good-path/stub.ai-text-generator.gateway.js';
import { StubCycleThemeSetCacheGateway } from '@modules/analytics/testing/good-path/stub.cycle-theme-set-cache.gateway.js';
import { StubCycleThemeSetDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-theme-set-data.gateway.js';
import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { DetectCycleThemesUsecase } from '@modules/analytics/usecases/detect-cycle-themes.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { CycleThemeSetBuilder } from '../../../builders/cycle-theme-set.builder.js';

function buildIssues(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    externalId: `issue-${index + 1}`,
    title: `Issue ${index + 1}`,
    labels: ['auth'],
    points: 2,
    statusName: 'In Progress',
    assigneeName: `Member ${index % 2}`,
    totalCycleTimeInHours: 1,
    linearUrl: null,
  }));
}

function aiThemesJson(themes: { name: string; issueExternalIds: string[] }[]) {
  return JSON.stringify({ themes });
}

describe('DetectCycleThemesUsecase', () => {
  let dataGateway: StubCycleThemeSetDataGateway;
  let cacheGateway: StubCycleThemeSetCacheGateway;
  let aiGateway: StubAiTextGeneratorGateway;
  let workspaceSettingsGateway: StubWorkspaceSettingsGateway;
  let usecase: DetectCycleThemesUsecase;

  beforeEach(() => {
    dataGateway = new StubCycleThemeSetDataGateway();
    cacheGateway = new StubCycleThemeSetCacheGateway();
    aiGateway = new StubAiTextGeneratorGateway();
    workspaceSettingsGateway = new StubWorkspaceSettingsGateway();
    usecase = new DetectCycleThemesUsecase(
      dataGateway,
      cacheGateway,
      aiGateway,
      workspaceSettingsGateway,
    );
  });

  it('returns no_active_cycle when team has no active cycle', async () => {
    const result = await usecase.execute({
      teamId: 'team-1',
      provider: 'Anthropic',
    });

    expect(result).toEqual({ status: 'no_active_cycle' });
  });

  it('returns below_threshold when cycle has fewer than 10 issues', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', buildIssues(7));

    const result = await usecase.execute({
      teamId: 'team-1',
      provider: 'Anthropic',
    });

    expect(result).toEqual({ status: 'below_threshold', issueCount: 7 });
  });

  it('returns ai_unavailable when AI provider is unavailable', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', buildIssues(15));
    const failingAi = new FailingAiTextGeneratorGateway();
    const failingUsecase = new DetectCycleThemesUsecase(
      dataGateway,
      cacheGateway,
      failingAi,
      workspaceSettingsGateway,
    );

    const result = await failingUsecase.execute({
      teamId: 'team-1',
      provider: 'Anthropic',
    });

    expect(result).toEqual({ status: 'ai_unavailable' });
  });

  it('returns ai_unavailable when AI response contains no parsable JSON block', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', buildIssues(15));
    aiGateway.generatedText = 'I cannot help with that request.';

    const result = await usecase.execute({
      teamId: 'team-1',
      provider: 'Anthropic',
    });

    expect(result).toEqual({ status: 'ai_unavailable' });
  });

  it('does not poison the cache when AI response is unparsable', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', buildIssues(15));
    aiGateway.generatedText = 'Sorry, no JSON here.';

    await usecase.execute({ teamId: 'team-1', provider: 'Anthropic' });

    expect(await cacheGateway.get('cycle-1')).toBeNull();
  });

  it('returns ready with fromCache=false after a successful AI call', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', buildIssues(15));
    aiGateway.generatedText = aiThemesJson([
      { name: 'Theme A', issueExternalIds: ['issue-1', 'issue-2'] },
    ]);

    const result = await usecase.execute({
      teamId: 'team-1',
      provider: 'Anthropic',
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.cycleId).toBe('cycle-1');
    expect(result.cycleName).toBe('Sprint 10');
    expect(result.fromCache).toBe(false);
    expect(result.themes).toHaveLength(1);
    expect(result.themes[0].name).toBe('Theme A');
    expect(result.themes[0].issueCount).toBe(2);
  });

  it('uses the cache when a fresh cached entry exists', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', buildIssues(15));
    const fresh = new CycleThemeSetBuilder()
      .withCycleId('cycle-1')
      .withTeamId('team-1')
      .withLanguage('EN')
      .withThemes([{ name: 'Cached', issueExternalIds: ['issue-1'] }])
      .withGeneratedAt(new Date().toISOString())
      .build();
    cacheGateway.seed(fresh);

    const result = await usecase.execute({
      teamId: 'team-1',
      provider: 'Anthropic',
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.fromCache).toBe(true);
    expect(result.themes[0].name).toBe('Cached');
    expect(aiGateway.receivedPrompt).toBe('');
  });

  it('refreshes cache when stale entry exceeds 24h', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', buildIssues(15));
    const stale = new CycleThemeSetBuilder()
      .withCycleId('cycle-1')
      .withTeamId('team-1')
      .withLanguage('EN')
      .withThemes([{ name: 'Stale', issueExternalIds: ['issue-1'] }])
      .withGeneratedAt(new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString())
      .build();
    cacheGateway.seed(stale);
    aiGateway.generatedText = aiThemesJson([
      { name: 'Fresh', issueExternalIds: ['issue-1', 'issue-2'] },
    ]);

    const result = await usecase.execute({
      teamId: 'team-1',
      provider: 'Anthropic',
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.fromCache).toBe(false);
    expect(result.themes[0].name).toBe('Fresh');
  });

  it('bypasses cache when forceRefresh is true', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', buildIssues(15));
    const fresh = new CycleThemeSetBuilder()
      .withCycleId('cycle-1')
      .withTeamId('team-1')
      .withLanguage('EN')
      .withThemes([{ name: 'Old', issueExternalIds: ['issue-1'] }])
      .withGeneratedAt(new Date().toISOString())
      .build();
    cacheGateway.seed(fresh);
    aiGateway.generatedText = aiThemesJson([
      { name: 'Forced', issueExternalIds: ['issue-1'] },
    ]);

    const result = await usecase.execute({
      teamId: 'team-1',
      provider: 'Anthropic',
      forceRefresh: true,
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.fromCache).toBe(false);
    expect(result.themes[0].name).toBe('Forced');
  });

  it('persists the AI result to the cache after a successful call', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', buildIssues(15));
    aiGateway.generatedText = aiThemesJson([
      { name: 'Saved', issueExternalIds: ['issue-1', 'issue-2'] },
    ]);

    await usecase.execute({ teamId: 'team-1', provider: 'Anthropic' });

    const cached = await cacheGateway.get('cycle-1');
    expect(cached?.themes).toEqual([
      { name: 'Saved', issueExternalIds: ['issue-1', 'issue-2'] },
    ]);
  });

  it('aggregates per theme: totalPoints and totalCycleTimeInHours summed', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', [
      ...buildIssues(10).map((issue, index) => ({
        ...issue,
        points: index < 2 ? 5 : 1,
        totalCycleTimeInHours: index < 2 ? 3 : 1,
      })),
    ]);
    aiGateway.generatedText = aiThemesJson([
      { name: 'T', issueExternalIds: ['issue-1', 'issue-2'] },
    ]);

    const result = await usecase.execute({
      teamId: 'team-1',
      provider: 'Anthropic',
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.themes[0].issueCount).toBe(2);
    expect(result.themes[0].totalPoints).toBe(10);
    expect(result.themes[0].totalCycleTimeInHours).toBe(6);
  });

  it('passes workspace language FR to the AI prompt', async () => {
    workspaceSettingsGateway.storedLanguage = 'fr';
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', buildIssues(15));
    aiGateway.generatedText = aiThemesJson([
      { name: 'Refonte auth', issueExternalIds: ['issue-1'] },
    ]);

    await usecase.execute({ teamId: 'team-1', provider: 'Anthropic' });

    expect(aiGateway.receivedPrompt.toLowerCase()).toContain('fran');
  });

  it('handles AI responses returning fewer than 5 themes', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues('cycle-1', buildIssues(15));
    aiGateway.generatedText = aiThemesJson([
      { name: 'A', issueExternalIds: ['issue-1'] },
      { name: 'B', issueExternalIds: ['issue-2'] },
      { name: 'C', issueExternalIds: ['issue-3'] },
    ]);

    const result = await usecase.execute({
      teamId: 'team-1',
      provider: 'Anthropic',
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.themes).toHaveLength(3);
  });

  it('returns totalCycleTimeInHours as null when all matching issues have null cycle time', async () => {
    dataGateway.setActiveCycle('team-1', {
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
    });
    dataGateway.setThemeCandidateIssues(
      'cycle-1',
      buildIssues(15).map((issue) => ({
        ...issue,
        totalCycleTimeInHours: null,
      })),
    );
    aiGateway.generatedText = aiThemesJson([
      { name: 'T', issueExternalIds: ['issue-1', 'issue-2'] },
    ]);

    const result = await usecase.execute({
      teamId: 'team-1',
      provider: 'Anthropic',
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.themes[0].totalCycleTimeInHours).toBeNull();
  });
});
