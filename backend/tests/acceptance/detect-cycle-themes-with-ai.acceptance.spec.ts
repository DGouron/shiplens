import { CycleThemeSet } from '@modules/analytics/entities/cycle-theme-set/cycle-theme-set.js';
import { CycleThemeIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-theme-issues.presenter.js';
import { CycleThemesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-themes.presenter.js';
import { FailingAiTextGeneratorGateway } from '@modules/analytics/testing/bad-path/failing.ai-text-generator.gateway.js';
import { StubAiTextGeneratorGateway } from '@modules/analytics/testing/good-path/stub.ai-text-generator.gateway.js';
import { StubCycleThemeSetCacheGateway } from '@modules/analytics/testing/good-path/stub.cycle-theme-set-cache.gateway.js';
import { StubCycleThemeSetDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-theme-set-data.gateway.js';
import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { DetectCycleThemesUsecase } from '@modules/analytics/usecases/detect-cycle-themes.usecase.js';
import { GetCycleIssuesForThemeUsecase } from '@modules/analytics/usecases/get-cycle-issues-for-theme.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

function buildCandidateIssues(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    externalId: `issue-${index + 1}`,
    title: `Issue ${index + 1}`,
    labels: ['auth'],
    points: index % 2 === 0 ? 3 : 2,
    statusName: 'In Progress',
    assigneeName: `Member ${index % 3}`,
    totalCycleTimeInHours: index + 1,
    linearUrl: `https://linear.app/issue-${index + 1}`,
  }));
}

function aiThemesJson(themes: { name: string; issueExternalIds: string[] }[]) {
  return JSON.stringify({ themes });
}

describe('Detect cycle themes with AI (acceptance)', () => {
  let dataGateway: StubCycleThemeSetDataGateway;
  let cacheGateway: StubCycleThemeSetCacheGateway;
  let aiGateway: StubAiTextGeneratorGateway;
  let workspaceSettingsGateway: StubWorkspaceSettingsGateway;
  let detectThemes: DetectCycleThemesUsecase;
  let getThemeIssues: GetCycleIssuesForThemeUsecase;
  let themesPresenter: CycleThemesPresenter;
  let themeIssuesPresenter: CycleThemeIssuesPresenter;

  beforeEach(() => {
    dataGateway = new StubCycleThemeSetDataGateway();
    cacheGateway = new StubCycleThemeSetCacheGateway();
    aiGateway = new StubAiTextGeneratorGateway();
    workspaceSettingsGateway = new StubWorkspaceSettingsGateway();
    detectThemes = new DetectCycleThemesUsecase(
      dataGateway,
      cacheGateway,
      aiGateway,
      workspaceSettingsGateway,
    );
    getThemeIssues = new GetCycleIssuesForThemeUsecase(
      dataGateway,
      cacheGateway,
    );
    themesPresenter = new CycleThemesPresenter();
    themeIssuesPresenter = new CycleThemeIssuesPresenter();
  });

  describe('the card surfaces AI-inferred themes for the active cycle', () => {
    it('nominal AI themes: 25 issues → 5 themes sorted by count descending', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setThemeCandidateIssues('cycle-1', buildCandidateIssues(25));
      aiGateway.generatedText = aiThemesJson([
        { name: 'Auth refactor', issueExternalIds: ['issue-1', 'issue-2'] },
        {
          name: 'Payments bugs',
          issueExternalIds: ['issue-3', 'issue-4', 'issue-5'],
        },
        {
          name: 'UI polish',
          issueExternalIds: [
            'issue-6',
            'issue-7',
            'issue-8',
            'issue-9',
            'issue-10',
          ],
        },
        {
          name: 'Infra',
          issueExternalIds: ['issue-11', 'issue-12', 'issue-13', 'issue-14'],
        },
        {
          name: 'Docs',
          issueExternalIds: [
            'issue-15',
            'issue-16',
            'issue-17',
            'issue-18',
            'issue-19',
            'issue-20',
          ],
        },
      ]);

      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-1',
          provider: 'Anthropic',
        }),
      );

      if (dto.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(dto.cycleId).toBe('cycle-1');
      expect(dto.themes).toHaveLength(5);
      expect(dto.themes.map((row) => row.name)).toEqual([
        'Docs',
        'UI polish',
        'Infra',
        'Payments bugs',
        'Auth refactor',
      ]);
      expect(dto.fromCache).toBe(false);
    });

    it('below threshold: 7 issues → status below_threshold, no AI call', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setThemeCandidateIssues('cycle-1', buildCandidateIssues(7));

      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-1',
          provider: 'Anthropic',
        }),
      );

      expect(dto).toEqual({ status: 'below_threshold', issueCount: 7 });
      expect(aiGateway.receivedPrompt).toBe('');
    });

    it('AI provider unavailable: returns status ai_unavailable', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setThemeCandidateIssues('cycle-1', buildCandidateIssues(15));
      const failingAi = new FailingAiTextGeneratorGateway();
      const usecase = new DetectCycleThemesUsecase(
        dataGateway,
        cacheGateway,
        failingAi,
        workspaceSettingsGateway,
      );

      const dto = themesPresenter.present(
        await usecase.execute({ teamId: 'team-1', provider: 'Anthropic' }),
      );

      expect(dto).toEqual({ status: 'ai_unavailable' });
    });

    it('cache hit within 24h: returns cached themes, no AI call', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setThemeCandidateIssues('cycle-1', buildCandidateIssues(15));
      const twoHoursAgo = new Date(
        Date.now() - 2 * 60 * 60 * 1000,
      ).toISOString();
      const cached = CycleThemeSet.create({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'EN',
        themes: [
          { name: 'Cached theme', issueExternalIds: ['issue-1', 'issue-2'] },
        ],
        generatedAt: twoHoursAgo,
      });
      cacheGateway.seed(cached);

      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-1',
          provider: 'Anthropic',
        }),
      );

      if (dto.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(dto.fromCache).toBe(true);
      expect(dto.themes.map((row) => row.name)).toEqual(['Cached theme']);
      expect(aiGateway.receivedPrompt).toBe('');
    });

    it('cache expired within active cycle: new AI call triggered, cache refreshed', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setThemeCandidateIssues('cycle-1', buildCandidateIssues(15));
      const yesterday = new Date(
        Date.now() - 25 * 60 * 60 * 1000,
      ).toISOString();
      const staleCached = CycleThemeSet.create({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'EN',
        themes: [{ name: 'Stale theme', issueExternalIds: ['issue-1'] }],
        generatedAt: yesterday,
      });
      cacheGateway.seed(staleCached);
      aiGateway.generatedText = aiThemesJson([
        { name: 'Fresh theme', issueExternalIds: ['issue-1', 'issue-2'] },
      ]);

      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-1',
          provider: 'Anthropic',
        }),
      );

      if (dto.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(dto.fromCache).toBe(false);
      expect(dto.themes.map((row) => row.name)).toEqual(['Fresh theme']);
      expect(aiGateway.receivedPrompt.length > 0).toBe(true);
    });

    it('cache invalidated at cycle end: new active cycle → no cache reuse', async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const pastCycleSet = CycleThemeSet.create({
        cycleId: 'cycle-past',
        teamId: 'team-1',
        language: 'EN',
        themes: [{ name: 'Old theme', issueExternalIds: ['x'] }],
        generatedAt: oneHourAgo,
      });
      cacheGateway.seed(pastCycleSet);
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-2',
        cycleName: 'Sprint 11',
      });
      dataGateway.setThemeCandidateIssues('cycle-2', buildCandidateIssues(15));
      aiGateway.generatedText = aiThemesJson([
        { name: 'New theme', issueExternalIds: ['issue-1'] },
      ]);

      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-1',
          provider: 'Anthropic',
        }),
      );

      if (dto.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(dto.cycleId).toBe('cycle-2');
      expect(dto.fromCache).toBe(false);
    });

    it('manual refresh: forceRefresh=true bypasses cache and overwrites it', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setThemeCandidateIssues('cycle-1', buildCandidateIssues(15));
      const cached = CycleThemeSet.create({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'EN',
        themes: [{ name: 'Stale', issueExternalIds: ['issue-1'] }],
        generatedAt: new Date().toISOString(),
      });
      cacheGateway.seed(cached);
      aiGateway.generatedText = aiThemesJson([
        { name: 'Forced', issueExternalIds: ['issue-1', 'issue-2'] },
      ]);

      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-1',
          provider: 'Anthropic',
          forceRefresh: true,
        }),
      );

      if (dto.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(dto.fromCache).toBe(false);
      expect(dto.themes.map((row) => row.name)).toEqual(['Forced']);
    });

    it('points aggregation: theme A (7 issues, 12 pts) and theme B (4 issues, 30 pts) → aggregates exposed', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      const issues = [
        ...Array.from({ length: 7 }, (_, index) => ({
          externalId: `a-${index}`,
          title: `A${index}`,
          labels: [],
          points: index === 0 ? 6 : 1,
          statusName: 'Done',
          assigneeName: null,
          totalCycleTimeInHours: 1,
          linearUrl: null,
        })),
        ...Array.from({ length: 4 }, (_, index) => ({
          externalId: `b-${index}`,
          title: `B${index}`,
          labels: [],
          points: index === 0 ? 24 : 2,
          statusName: 'Done',
          assigneeName: null,
          totalCycleTimeInHours: 2,
          linearUrl: null,
        })),
      ];
      dataGateway.setThemeCandidateIssues('cycle-1', issues);
      aiGateway.generatedText = aiThemesJson([
        {
          name: 'A',
          issueExternalIds: issues.slice(0, 7).map((issue) => issue.externalId),
        },
        {
          name: 'B',
          issueExternalIds: issues.slice(7).map((issue) => issue.externalId),
        },
      ]);

      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-1',
          provider: 'Anthropic',
        }),
      );

      if (dto.status !== 'ready') {
        throw new Error('expected ready status');
      }
      const rowA = dto.themes.find((row) => row.name === 'A');
      const rowB = dto.themes.find((row) => row.name === 'B');
      expect(rowA?.issueCount).toBe(7);
      expect(rowA?.totalPoints).toBe(12);
      expect(rowB?.issueCount).toBe(4);
      expect(rowB?.totalPoints).toBe(30);
    });

    it('time aggregation: themes expose summed cycle time', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      const issues = [
        {
          externalId: 'i-1',
          title: 't1',
          labels: [],
          points: 1,
          statusName: 'Done',
          assigneeName: null,
          totalCycleTimeInHours: 4,
          linearUrl: null,
        },
        {
          externalId: 'i-2',
          title: 't2',
          labels: [],
          points: 1,
          statusName: 'Done',
          assigneeName: null,
          totalCycleTimeInHours: 6,
          linearUrl: null,
        },
        ...Array.from({ length: 8 }, (_, index) => ({
          externalId: `pad-${index}`,
          title: `pad${index}`,
          labels: [],
          points: 0,
          statusName: 'Done',
          assigneeName: null,
          totalCycleTimeInHours: 1,
          linearUrl: null,
        })),
      ];
      dataGateway.setThemeCandidateIssues('cycle-1', issues);
      aiGateway.generatedText = aiThemesJson([
        { name: 'T', issueExternalIds: ['i-1', 'i-2'] },
      ]);

      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-1',
          provider: 'Anthropic',
        }),
      );

      if (dto.status !== 'ready') {
        throw new Error('expected ready status');
      }
      const row = dto.themes.find((themeRow) => themeRow.name === 'T');
      expect(row?.totalCycleTimeInHours).toBe(10);
    });

    it('drill-down by theme name: returns issues classified in that theme', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      const issues = [
        {
          externalId: 'issue-1',
          title: 'Fix login',
          labels: [],
          points: 3,
          statusName: 'Done',
          assigneeName: 'Alice',
          totalCycleTimeInHours: 4,
          linearUrl: 'https://linear.app/issue-1',
        },
        ...Array.from({ length: 14 }, (_, index) => ({
          externalId: `other-${index}`,
          title: `other${index}`,
          labels: [],
          points: 1,
          statusName: 'Done',
          assigneeName: null,
          totalCycleTimeInHours: 1,
          linearUrl: null,
        })),
      ];
      dataGateway.setThemeCandidateIssues('cycle-1', issues);
      const cached = CycleThemeSet.create({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'EN',
        themes: [{ name: 'Auth refactor', issueExternalIds: ['issue-1'] }],
        generatedAt: new Date().toISOString(),
      });
      cacheGateway.seed(cached);

      const dto = themeIssuesPresenter.present(
        await getThemeIssues.execute({
          teamId: 'team-1',
          themeName: 'Auth refactor',
        }),
      );

      if (dto.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(dto.themeName).toBe('Auth refactor');
      expect(dto.issues).toEqual([
        {
          externalId: 'issue-1',
          title: 'Fix login',
          assigneeName: 'Alice',
          points: 3,
          statusName: 'Done',
          linearUrl: 'https://linear.app/issue-1',
        },
      ]);
    });

    it('theme names in workspace language: language passed to the prompt', async () => {
      workspaceSettingsGateway.storedLanguage = 'fr';
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setThemeCandidateIssues('cycle-1', buildCandidateIssues(15));
      aiGateway.generatedText = aiThemesJson([
        { name: 'Refonte auth', issueExternalIds: ['issue-1'] },
      ]);

      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-1',
          provider: 'Anthropic',
        }),
      );

      if (dto.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(dto.language).toBe('FR');
      expect(aiGateway.receivedPrompt.toLowerCase()).toContain('fran');
    });

    it('language switch mid-view: cached language persists until next refresh', async () => {
      workspaceSettingsGateway.storedLanguage = 'fr';
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setThemeCandidateIssues('cycle-1', buildCandidateIssues(15));
      const cached = CycleThemeSet.create({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'EN',
        themes: [{ name: 'Cached English', issueExternalIds: ['issue-1'] }],
        generatedAt: new Date().toISOString(),
      });
      cacheGateway.seed(cached);

      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-1',
          provider: 'Anthropic',
        }),
      );

      if (dto.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(dto.language).toBe('EN');
      expect(dto.themes.map((row) => row.name)).toEqual(['Cached English']);
    });

    it('no active cycle: returns status no_active_cycle', async () => {
      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-1',
          provider: 'Anthropic',
        }),
      );

      expect(dto).toEqual({ status: 'no_active_cycle' });
    });

    it('team switch reloads: cache keyed per cycle, other team uncached', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setActiveCycle('team-2', {
        cycleId: 'cycle-99',
        cycleName: 'Sprint 99',
      });
      dataGateway.setThemeCandidateIssues('cycle-99', buildCandidateIssues(15));
      const cachedForTeam1 = CycleThemeSet.create({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        language: 'EN',
        themes: [{ name: 'Cached', issueExternalIds: ['issue-1'] }],
        generatedAt: new Date().toISOString(),
      });
      cacheGateway.seed(cachedForTeam1);
      aiGateway.generatedText = aiThemesJson([
        { name: 'Team2 theme', issueExternalIds: ['issue-1'] },
      ]);

      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-2',
          provider: 'Anthropic',
        }),
      );

      if (dto.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(dto.cycleId).toBe('cycle-99');
      expect(dto.fromCache).toBe(false);
      expect(dto.themes.map((row) => row.name)).toEqual(['Team2 theme']);
    });

    it('AI returns fewer than 5 themes: 3 rows rendered, no padding', async () => {
      dataGateway.setActiveCycle('team-1', {
        cycleId: 'cycle-1',
        cycleName: 'Sprint 10',
      });
      dataGateway.setThemeCandidateIssues('cycle-1', buildCandidateIssues(15));
      aiGateway.generatedText = aiThemesJson([
        { name: 'Theme A', issueExternalIds: ['issue-1', 'issue-2'] },
        { name: 'Theme B', issueExternalIds: ['issue-3', 'issue-4'] },
        { name: 'Theme C', issueExternalIds: ['issue-5'] },
      ]);

      const dto = themesPresenter.present(
        await detectThemes.execute({
          teamId: 'team-1',
          provider: 'Anthropic',
        }),
      );

      if (dto.status !== 'ready') {
        throw new Error('expected ready status');
      }
      expect(dto.themes).toHaveLength(3);
    });
  });
});
