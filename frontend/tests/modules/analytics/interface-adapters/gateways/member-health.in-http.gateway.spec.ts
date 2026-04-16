import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemberHealthInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/member-health.in-http.gateway.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { MemberHealthResponseBuilder } from '../../../../builders/member-health-response.builder.ts';

function stubFetchOnce(response: Partial<Response>): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('MemberHealthInHttpGateway', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches the correct URL and returns the parsed response', async () => {
    const payload = new MemberHealthResponseBuilder().build();
    const fetchMock = stubFetchOnce({
      ok: true,
      status: 200,
      json: async () => payload,
    });

    const gateway = new MemberHealthInHttpGateway();
    const result = await gateway.fetchMemberHealth({
      teamId: 'team-1',
      memberName: 'Alice',
      cycles: 5,
    });

    expect(result).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/analytics/teams/team-1/members/Alice/health?cycles=5',
    );
  });

  it('returns null when the API responds with 422', async () => {
    stubFetchOnce({ ok: false, status: 422, json: async () => ({}) });

    const gateway = new MemberHealthInHttpGateway();
    const result = await gateway.fetchMemberHealth({
      teamId: 'team-1',
      memberName: 'Alice',
      cycles: 5,
    });

    expect(result).toBeNull();
  });

  it('throws GatewayError on non-OK non-422 HTTP response', async () => {
    stubFetchOnce({ ok: false, status: 500, json: async () => ({}) });

    const gateway = new MemberHealthInHttpGateway();

    await expect(
      gateway.fetchMemberHealth({
        teamId: 'team-1',
        memberName: 'Alice',
        cycles: 5,
      }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('throws GatewayError when the payload fails schema validation', async () => {
    stubFetchOnce({
      ok: true,
      status: 200,
      json: async () => ({ teamId: 123 }),
    });

    const gateway = new MemberHealthInHttpGateway();

    await expect(
      gateway.fetchMemberHealth({
        teamId: 'team-1',
        memberName: 'Alice',
        cycles: 5,
      }),
    ).rejects.toBeInstanceOf(GatewayError);
  });

  it('encodes teamId and memberName in the URL', async () => {
    const payload = new MemberHealthResponseBuilder().build();
    const fetchMock = stubFetchOnce({
      ok: true,
      status: 200,
      json: async () => payload,
    });

    const gateway = new MemberHealthInHttpGateway();
    await gateway.fetchMemberHealth({
      teamId: 'team/1',
      memberName: 'John Doe',
      cycles: 3,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/analytics/teams/team%2F1/members/John%20Doe/health?cycles=3',
    );
  });
});
