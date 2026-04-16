import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemberDigestInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/member-digest.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { MemberDigestResponseBuilder } from '../../../../builders/member-digest-response.builder.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('MemberDigestInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('posts to /analytics/cycles/:cycleId/member-digest with teamId, memberName and hardcoded provider', async () => {
    const payload = new MemberDigestResponseBuilder()
      .withMemberName('Alice')
      .withDigest('# Alice report')
      .build();
    const fetchMock = stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new MemberDigestInHttpGateway();
    const result = await gateway.generate({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      memberName: 'Alice',
    });

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      '/analytics/cycles/cycle-1/member-digest',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: 'team-1',
          memberName: 'Alice',
          provider: 'Anthropic',
        }),
      },
    );
  });

  it('throws GatewayError when the endpoint returns a non-OK status', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const gateway = new MemberDigestInHttpGateway();

    await expect(
      gateway.generate({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        memberName: 'Alice',
      }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the response payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      json: async () => ({ memberName: 123, digest: true }),
    });

    const gateway = new MemberDigestInHttpGateway();

    await expect(
      gateway.generate({
        cycleId: 'cycle-1',
        teamId: 'team-1',
        memberName: 'Alice',
      }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('returns a response with null digest when the backend returns null', async () => {
    const payload = new MemberDigestResponseBuilder()
      .withMemberName('Bob')
      .withDigest(null)
      .build();
    stubFetchOnce({ ok: true, json: async () => payload });

    const gateway = new MemberDigestInHttpGateway();
    const result = await gateway.generate({
      cycleId: 'cycle-2',
      teamId: 'team-1',
      memberName: 'Bob',
    });

    expect(result.digest).toBeNull();
    expect(result.memberName).toBe('Bob');
  });
});
