import { AiProviderUnavailableError } from '@modules/analytics/entities/sprint-report/sprint-report.errors.js';
import { FailingAiTextGeneratorGateway } from '@modules/analytics/testing/bad-path/failing.ai-text-generator.gateway.js';
import { StubAiTextGeneratorGateway } from '@modules/analytics/testing/good-path/stub.ai-text-generator.gateway.js';
import { StubMemberDigestDataGateway } from '@modules/analytics/testing/good-path/stub.member-digest-data.gateway.js';
import { GenerateMemberDigestUsecase } from '@modules/analytics/usecases/generate-member-digest.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('GenerateMemberDigestUsecase', () => {
  let memberDigestDataGateway: StubMemberDigestDataGateway;
  let aiTextGeneratorGateway: StubAiTextGeneratorGateway;
  let usecase: GenerateMemberDigestUsecase;

  beforeEach(() => {
    memberDigestDataGateway = new StubMemberDigestDataGateway();
    aiTextGeneratorGateway = new StubAiTextGeneratorGateway();
    usecase = new GenerateMemberDigestUsecase(
      memberDigestDataGateway,
      aiTextGeneratorGateway,
    );
  });

  it('should generate a digest for a member with issues', async () => {
    aiTextGeneratorGateway.generatedText =
      'Alice travaille sur Fix login bug, bloquee depuis 48h. Add tests en review.';

    const result = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      memberName: 'Alice',
      provider: 'Anthropic',
    });

    expect(result.memberName).toBe('Alice');
    expect(result.digest).toBe(
      'Alice travaille sur Fix login bug, bloquee depuis 48h. Add tests en review.',
    );
    expect(aiTextGeneratorGateway.receivedProvider).toBe('Anthropic');
    expect(aiTextGeneratorGateway.receivedPrompt).toContain('Alice');
    expect(aiTextGeneratorGateway.receivedPrompt).toContain('Sprint 42');
    expect(aiTextGeneratorGateway.receivedPrompt).toContain('Fix login bug');
  });

  it('should return a static message when the member has no issues', async () => {
    memberDigestDataGateway.context = {
      memberName: 'Bob',
      cycleName: 'Sprint 42',
      issues: [],
      blockedIssues: [],
    };

    const result = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      memberName: 'Bob',
      provider: 'Anthropic',
    });

    expect(result.memberName).toBe('Bob');
    expect(result.digest).toBe('Aucune issue en cours pour ce membre.');
    expect(aiTextGeneratorGateway.receivedPrompt).toBe('');
  });

  it('should propagate error when AI provider fails', async () => {
    const failingAiGateway = new FailingAiTextGeneratorGateway();
    const usecaseWithFailing = new GenerateMemberDigestUsecase(
      memberDigestDataGateway,
      failingAiGateway,
    );

    await expect(
      usecaseWithFailing.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        memberName: 'Alice',
        provider: 'Anthropic',
      }),
    ).rejects.toThrow(AiProviderUnavailableError);
  });
});
