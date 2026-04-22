import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TopCycleThemesGateway } from '../entities/top-cycle-themes/top-cycle-themes.gateway.ts';
import { type TopCycleThemesResponse } from '../entities/top-cycle-themes/top-cycle-themes.response.ts';

export interface GetTopCycleThemesParams {
  teamId: string;
  forceRefresh: boolean;
  provider?: string;
}

export class GetTopCycleThemesUsecase
  implements Usecase<GetTopCycleThemesParams, TopCycleThemesResponse>
{
  constructor(private readonly gateway: TopCycleThemesGateway) {}

  async execute(
    params: GetTopCycleThemesParams,
  ): Promise<TopCycleThemesResponse> {
    return this.gateway.fetchTopCycleThemes({
      teamId: params.teamId,
      forceRefresh: params.forceRefresh,
      provider: params.provider,
    });
  }
}
