import { Controller, Post, Param, Body } from '@nestjs/common';
import { GenerateMemberDigestUsecase } from '../../usecases/generate-member-digest.usecase.js';
import { type AiProvider } from '../../entities/sprint-report/ai-text-generator.gateway.js';

interface GenerateMemberDigestBody {
  teamId: string;
  memberName: string;
  provider: AiProvider;
}

@Controller('analytics/cycles')
export class MemberDigestController {
  constructor(
    private readonly generateMemberDigest: GenerateMemberDigestUsecase,
  ) {}

  @Post(':cycleId/member-digest')
  async generate(
    @Param('cycleId') cycleId: string,
    @Body() body: GenerateMemberDigestBody,
  ): Promise<{ memberName: string; digest: string }> {
    return this.generateMemberDigest.execute({
      cycleId,
      teamId: body.teamId,
      memberName: body.memberName,
      provider: body.provider,
    });
  }
}
