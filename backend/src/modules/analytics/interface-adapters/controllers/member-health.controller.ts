import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetMemberHealthUsecase } from '../../usecases/get-member-health.usecase.js';
import {
  type MemberHealthDto,
  MemberHealthPresenter,
} from '../presenters/member-health.presenter.js';

const DEFAULT_CYCLES = 5;

@Controller('api/analytics/teams')
export class MemberHealthController {
  constructor(
    private readonly getMemberHealthUsecase: GetMemberHealthUsecase,
    private readonly memberHealthPresenter: MemberHealthPresenter,
  ) {}

  @Get(':teamId/members/:memberName/health')
  async getMemberHealth(
    @Param('teamId') teamId: string,
    @Param('memberName') memberName: string,
    @Query('cycles') cyclesParam: string | undefined,
  ): Promise<MemberHealthDto> {
    const cycles = parseCyclesParam(cyclesParam);

    const health = await this.getMemberHealthUsecase.execute({
      teamId,
      memberName,
      cycles,
    });

    return this.memberHealthPresenter.present(health);
  }
}

function parseCyclesParam(cyclesParam: string | undefined): number {
  if (cyclesParam === undefined) return DEFAULT_CYCLES;
  const parsed = Number.parseInt(cyclesParam, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return DEFAULT_CYCLES;
  return parsed;
}
