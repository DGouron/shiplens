import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TopCycleThemesGateway } from '../entities/top-cycle-themes/top-cycle-themes.gateway.ts';
import { type CycleThemeIssuesResponse } from '../entities/top-cycle-themes/top-cycle-themes.response.ts';

export interface ListCycleThemeIssuesParams {
  teamId: string;
  themeName: string;
}

export class ListCycleThemeIssuesUsecase
  implements Usecase<ListCycleThemeIssuesParams, CycleThemeIssuesResponse>
{
  constructor(private readonly gateway: TopCycleThemesGateway) {}

  async execute(
    params: ListCycleThemeIssuesParams,
  ): Promise<CycleThemeIssuesResponse> {
    return this.gateway.fetchCycleThemeIssues({
      teamId: params.teamId,
      themeName: params.themeName,
    });
  }
}
