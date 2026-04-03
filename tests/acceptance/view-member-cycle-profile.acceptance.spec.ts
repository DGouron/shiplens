import { FailingAiTextGeneratorGateway } from '@modules/analytics/testing/bad-path/failing.ai-text-generator.gateway.js';
import { StubAiTextGeneratorGateway } from '@modules/analytics/testing/good-path/stub.ai-text-generator.gateway.js';
import { StubMemberDigestDataGateway } from '@modules/analytics/testing/good-path/stub.member-digest-data.gateway.js';
import { GenerateMemberDigestUsecase } from '@modules/analytics/usecases/generate-member-digest.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('View Member Cycle Profile (acceptance)', () => {
  let memberDigestDataGateway: StubMemberDigestDataGateway;
  let aiTextGeneratorGateway: StubAiTextGeneratorGateway;
  let generateMemberDigest: GenerateMemberDigestUsecase;

  beforeEach(() => {
    memberDigestDataGateway = new StubMemberDigestDataGateway();
    aiTextGeneratorGateway = new StubAiTextGeneratorGateway();
    generateMemberDigest = new GenerateMemberDigestUsecase(
      memberDigestDataGateway,
      aiTextGeneratorGateway,
    );
  });

  describe('digest nominal: member with issues gets an AI-generated summary', () => {
    it('generates a digest for Alice with 3 issues in progress', async () => {
      aiTextGeneratorGateway.generatedText =
        'Alice travaille sur Fix login bug, bloquee sur In Progress depuis 48h, Add tests en review.';

      const result = await generateMemberDigest.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        memberName: 'Alice',
        provider: 'Anthropic',
      });

      expect(result.memberName).toBe('Alice');
      expect(result.digest).toContain('Alice');
      expect(result.digest).toContain('Fix login bug');
    });
  });

  describe('no issues: member with 0 issues returns static message', () => {
    it('returns a static message when the member has no issues', async () => {
      memberDigestDataGateway.context = {
        memberName: 'Bob',
        cycleName: 'Sprint 42',
        issues: [],
        blockedIssues: [],
      };

      const result = await generateMemberDigest.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        memberName: 'Bob',
        provider: 'Anthropic',
      });

      expect(result.memberName).toBe('Bob');
      expect(result.digest).toBe('Aucune issue en cours pour ce membre.');
    });
  });

  describe('AI provider failure: error propagates and digest is not generated', () => {
    it('propagates error when AI provider is unavailable', async () => {
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
      ).rejects.toThrow();
    });
  });
});
