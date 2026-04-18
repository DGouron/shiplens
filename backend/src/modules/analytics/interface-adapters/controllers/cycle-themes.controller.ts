import { Controller, Get, Param, Query } from '@nestjs/common';
import { type AiProvider } from '../../entities/sprint-report/ai-text-generator.gateway.js';
import { DetectCycleThemesUsecase } from '../../usecases/detect-cycle-themes.usecase.js';
import { GetCycleIssuesForThemeUsecase } from '../../usecases/get-cycle-issues-for-theme.usecase.js';
import {
  type CycleThemeIssuesDto,
  CycleThemeIssuesPresenter,
} from '../presenters/cycle-theme-issues.presenter.js';
import {
  type CycleThemesDto,
  CycleThemesPresenter,
} from '../presenters/cycle-themes.presenter.js';

const SUPPORTED_PROVIDERS: AiProvider[] = ['OpenAI', 'Anthropic', 'Ollama'];

@Controller('analytics/cycle-themes')
export class CycleThemesController {
  constructor(
    private readonly detectCycleThemes: DetectCycleThemesUsecase,
    private readonly getCycleIssuesForTheme: GetCycleIssuesForThemeUsecase,
    private readonly themesPresenter: CycleThemesPresenter,
    private readonly themeIssuesPresenter: CycleThemeIssuesPresenter,
  ) {}

  @Get(':teamId')
  async getThemes(
    @Param('teamId') teamId: string,
    @Query('provider') providerParam: string | undefined,
    @Query('refresh') refreshParam: string | undefined,
  ): Promise<CycleThemesDto> {
    const provider = resolveProvider(providerParam);
    const forceRefresh = isTruthyString(refreshParam);

    const result = await this.detectCycleThemes.execute({
      teamId,
      provider,
      forceRefresh,
    });

    return this.themesPresenter.present(result);
  }

  @Get(':teamId/themes/:themeName/issues')
  async getThemeIssues(
    @Param('teamId') teamId: string,
    @Param('themeName') themeName: string,
  ): Promise<CycleThemeIssuesDto> {
    const result = await this.getCycleIssuesForTheme.execute({
      teamId,
      themeName,
    });

    return this.themeIssuesPresenter.present(result);
  }
}

function resolveProvider(providerParam: string | undefined): AiProvider {
  if (providerParam !== undefined) {
    const matched = SUPPORTED_PROVIDERS.find(
      (provider) => provider === providerParam,
    );
    if (matched !== undefined) {
      return matched;
    }
  }
  return 'Anthropic';
}

function isTruthyString(value: string | undefined): boolean {
  if (value === undefined) {
    return false;
  }
  const normalized = value.toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes';
}
