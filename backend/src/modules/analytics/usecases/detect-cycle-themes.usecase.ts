import { Injectable, Logger } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { CycleThemeSet } from '../entities/cycle-theme-set/cycle-theme-set.js';
import {
  type CycleTheme,
  type ThemeCandidateIssue,
} from '../entities/cycle-theme-set/cycle-theme-set.schema.js';
import { CycleThemeSetCacheGateway } from '../entities/cycle-theme-set/cycle-theme-set-cache.gateway.js';
import { CycleThemeSetDataGateway } from '../entities/cycle-theme-set/cycle-theme-set-data.gateway.js';
import {
  type AiProvider,
  AiTextGeneratorGateway,
} from '../entities/sprint-report/ai-text-generator.gateway.js';
import { AiProviderUnavailableError } from '../entities/sprint-report/sprint-report.errors.js';
import { WorkspaceSettingsGateway } from '../entities/workspace-settings/workspace-settings.gateway.js';

interface DetectCycleThemesParams {
  teamId: string;
  provider: AiProvider;
  forceRefresh?: boolean;
}

export interface ThemeAggregate {
  name: string;
  issueCount: number;
  totalPoints: number;
  totalCycleTimeInHours: number | null;
  issueExternalIds: string[];
}

export type DetectCycleThemesResult =
  | { status: 'no_active_cycle' }
  | { status: 'below_threshold'; issueCount: number }
  | { status: 'ai_unavailable' }
  | {
      status: 'ready';
      cycleId: string;
      cycleName: string;
      language: 'EN' | 'FR';
      themes: ThemeAggregate[];
      fromCache: boolean;
    };

const MINIMUM_ISSUES_FOR_THEME_DETECTION = 10;
const CACHE_TTL_MILLISECONDS = 24 * 60 * 60 * 1000;

@Injectable()
export class DetectCycleThemesUsecase
  implements Usecase<DetectCycleThemesParams, DetectCycleThemesResult>
{
  private readonly logger = new Logger(DetectCycleThemesUsecase.name);

  constructor(
    private readonly dataGateway: CycleThemeSetDataGateway,
    private readonly cacheGateway: CycleThemeSetCacheGateway,
    private readonly aiTextGeneratorGateway: AiTextGeneratorGateway,
    private readonly workspaceSettingsGateway: WorkspaceSettingsGateway,
  ) {}

  async execute(
    params: DetectCycleThemesParams,
  ): Promise<DetectCycleThemesResult> {
    const locator = await this.dataGateway.getActiveCycleLocator(params.teamId);

    if (locator === null) {
      return { status: 'no_active_cycle' };
    }

    if (params.forceRefresh) {
      await this.cacheGateway.delete(locator.cycleId);
    } else {
      const cached = await this.cacheGateway.get(locator.cycleId);
      if (
        cached?.isCachedWithin(new Date().toISOString(), CACHE_TTL_MILLISECONDS)
      ) {
        const candidateIssues =
          await this.dataGateway.getCycleIssuesForThemeDetection(
            params.teamId,
            locator.cycleId,
          );
        return {
          status: 'ready',
          cycleId: locator.cycleId,
          cycleName: locator.cycleName,
          language: cached.language,
          themes: aggregateThemes(cached.themes, candidateIssues),
          fromCache: true,
        };
      }
    }

    const candidateIssues =
      await this.dataGateway.getCycleIssuesForThemeDetection(
        params.teamId,
        locator.cycleId,
      );

    if (candidateIssues.length < MINIMUM_ISSUES_FOR_THEME_DETECTION) {
      return {
        status: 'below_threshold',
        issueCount: candidateIssues.length,
      };
    }

    const locale = await this.workspaceSettingsGateway.getLanguage();
    const language = locale.toUpperCase() === 'FR' ? 'FR' : 'EN';

    const prompt = buildPrompt(candidateIssues, language);

    let generatedText: string;
    try {
      generatedText = await this.aiTextGeneratorGateway.generate(
        prompt,
        params.provider,
      );
    } catch (error) {
      if (error instanceof AiProviderUnavailableError) {
        return { status: 'ai_unavailable' };
      }
      throw error;
    }

    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      this.logger.warn(
        `[${locator.cycleId}] AI response contains no parsable JSON — degrading to ai_unavailable: ${generatedText.substring(0, 200)}`,
      );
      return { status: 'ai_unavailable' };
    }
    const parsed = JSON.parse(jsonMatch[0]) as { themes?: unknown };
    const rawThemes = Array.isArray(parsed.themes) ? parsed.themes : [];

    const themeSet = CycleThemeSet.create({
      cycleId: locator.cycleId,
      teamId: params.teamId,
      language,
      themes: rawThemes,
      generatedAt: new Date().toISOString(),
    });

    await this.cacheGateway.save(themeSet);

    return {
      status: 'ready',
      cycleId: locator.cycleId,
      cycleName: locator.cycleName,
      language: themeSet.language,
      themes: aggregateThemes(themeSet.themes, candidateIssues),
      fromCache: false,
    };
  }
}

function aggregateThemes(
  themes: readonly CycleTheme[],
  candidateIssues: ThemeCandidateIssue[],
): ThemeAggregate[] {
  const issueByExternalId = new Map<string, ThemeCandidateIssue>();
  for (const issue of candidateIssues) {
    issueByExternalId.set(issue.externalId, issue);
  }

  return themes.map((theme) => {
    const matchingIssues = theme.issueExternalIds
      .map((externalId) => issueByExternalId.get(externalId))
      .filter((issue): issue is ThemeCandidateIssue => issue !== undefined);

    const totalPoints = matchingIssues.reduce(
      (sum, issue) => sum + (issue.points ?? 0),
      0,
    );
    const totalCycleTimeInHours = matchingIssues.reduce<number | null>(
      (sum, issue) => {
        if (issue.totalCycleTimeInHours === null) {
          return sum;
        }
        return (sum ?? 0) + issue.totalCycleTimeInHours;
      },
      null,
    );

    return {
      name: theme.name,
      issueCount: theme.issueExternalIds.length,
      totalPoints,
      totalCycleTimeInHours,
      issueExternalIds: [...theme.issueExternalIds],
    };
  });
}

function buildPrompt(
  candidateIssues: ThemeCandidateIssue[],
  language: 'EN' | 'FR',
): string {
  const languageInstruction =
    language === 'FR'
      ? 'Génère les noms des thèmes en français.'
      : 'Generate the theme names in English.';

  const issueLines = candidateIssues
    .map(
      (issue) =>
        `- ${issue.externalId}: ${issue.title}${issue.labels.length > 0 ? ` [labels: ${issue.labels.join(', ')}]` : ''}`,
    )
    .join('\n');

  return [
    'Cluster the following cycle issues into at most 5 semantic themes based on their title and labels.',
    'Each theme must have a short name (1 to 3 words) and list the issue identifiers classified in it.',
    languageInstruction,
    'Respond as JSON: {"themes": [{"name": "...", "issueExternalIds": ["..."]}]}.',
    'Issues:',
    issueLines,
  ].join('\n');
}
