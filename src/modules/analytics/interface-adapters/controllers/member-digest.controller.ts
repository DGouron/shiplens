import { Body, Controller, Param, Post } from '@nestjs/common';
import { type AiProvider } from '../../entities/sprint-report/ai-text-generator.gateway.js';
import { GenerateMemberDigestUsecase } from '../../usecases/generate-member-digest.usecase.js';

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
