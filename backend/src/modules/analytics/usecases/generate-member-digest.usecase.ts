import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import {
  type MemberCycleContext,
  MemberDigestDataGateway,
} from '../entities/member-digest/member-digest-data.gateway.js';
import {
  type AiProvider,
  AiTextGeneratorGateway,
} from '../entities/sprint-report/ai-text-generator.gateway.js';

interface GenerateMemberDigestParams {
  cycleId: string;
  teamId: string;
  memberName: string;
  provider: AiProvider;
}

interface MemberDigestResult {
  memberName: string;
  digest: string | null;
}

@Injectable()
export class GenerateMemberDigestUsecase
  implements Usecase<GenerateMemberDigestParams, MemberDigestResult>
{
  constructor(
    private readonly memberDigestDataGateway: MemberDigestDataGateway,
    private readonly aiTextGeneratorGateway: AiTextGeneratorGateway,
  ) {}

  async execute(
    params: GenerateMemberDigestParams,
  ): Promise<MemberDigestResult> {
    const context = await this.memberDigestDataGateway.getMemberCycleContext(
      params.cycleId,
      params.teamId,
      params.memberName,
    );

    if (context.issues.length === 0) {
      return {
        memberName: params.memberName,
        digest: null,
      };
    }

    const prompt = this.buildPrompt(context);
    const digest = await this.aiTextGeneratorGateway.generate(
      prompt,
      params.provider,
    );

    return { memberName: params.memberName, digest };
  }

  private buildPrompt(context: MemberCycleContext): string {
    const issuesList = context.issues
      .map(
        (issue) =>
          `- ${issue.title} (${issue.statusName}, ${issue.points ?? 0} pts, ${issue.timeInCurrentStatusHours}h dans ce statut)`,
      )
      .join('\n');

    const blockedList =
      context.blockedIssues.length > 0
        ? context.blockedIssues
            .map(
              (issue) =>
                `- ${issue.title} (${issue.statusName}, bloquee depuis ${issue.durationHours}h)`,
            )
            .join('\n')
        : 'Aucune issue bloquee.';

    return [
      `Genere un digest concis en francais pour ${context.memberName} sur le cycle "${context.cycleName}".`,
      `Issues en cours :`,
      issuesList,
      `Issues bloquees :`,
      blockedList,
      `Redige 2-3 phrases resumant le travail en cours, les blocages eventuels et le temps passe dans chaque statut.`,
      `Sois factuel et direct. Ne commence pas par "Voici" ou "Le digest".`,
    ].join('\n');
  }
}
