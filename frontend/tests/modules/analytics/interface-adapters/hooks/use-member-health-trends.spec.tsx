import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useMemberHealthTrends } from '@/modules/analytics/interface-adapters/hooks/use-member-health-trends.ts';
import { FailingMemberHealthGateway } from '@/modules/analytics/testing/bad-path/failing.member-health.in-memory.gateway.ts';
import { StubMemberHealthGateway } from '@/modules/analytics/testing/good-path/stub.member-health.in-memory.gateway.ts';
import { GetMemberHealthUsecase } from '@/modules/analytics/usecases/get-member-health.usecase.ts';
import { MemberHealthResponseBuilder } from '../../../../builders/member-health-response.builder.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function createWrapper(initialPath: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialPath]}>
        {withQueryClient(children, createTestQueryClient())}
      </MemoryRouter>
    );
  };
}

describe('useMemberHealthTrends', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('exposes a loading state on first render', () => {
    overrideUsecases({
      getMemberHealth: new GetMemberHealthUsecase(
        new StubMemberHealthGateway(),
      ),
    });

    const { result } = renderHook(() => useMemberHealthTrends(), {
      wrapper: createWrapper(
        '/member-health-trends?teamId=team-1&memberName=Alice',
      ),
    });

    expect(result.current.state.status).toBe('loading');
  });

  it('transitions to ready with the view model when data is available', async () => {
    const response = new MemberHealthResponseBuilder()
      .withMemberName('Alice')
      .withEstimationScore({
        value: '78%',
        trend: 'rising',
        indicator: 'green',
      })
      .build();
    overrideUsecases({
      getMemberHealth: new GetMemberHealthUsecase(
        new StubMemberHealthGateway({ response }),
      ),
    });

    const { result } = renderHook(() => useMemberHealthTrends(), {
      wrapper: createWrapper(
        '/member-health-trends?teamId=team-1&memberName=Alice',
      ),
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.memberName).toBe('Alice');
      const estimation = result.current.state.data.signals.find(
        (signal) => signal.id === 'estimationScore',
      );
      expect(estimation?.value).toBe('78%');
    }
  });

  it('transitions to empty when the gateway returns null', async () => {
    overrideUsecases({
      getMemberHealth: new GetMemberHealthUsecase(
        new StubMemberHealthGateway({ response: null }),
      ),
    });

    const { result } = renderHook(() => useMemberHealthTrends(), {
      wrapper: createWrapper(
        '/member-health-trends?teamId=team-1&memberName=Bob',
      ),
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('empty');
    });
    if (result.current.state.status === 'empty') {
      expect(result.current.state.message).toBe(
        'No data available for this member',
      );
    }
  });

  it('transitions to error when the gateway fails', async () => {
    overrideUsecases({
      getMemberHealth: new GetMemberHealthUsecase(
        new FailingMemberHealthGateway(),
      ),
    });

    const { result } = renderHook(() => useMemberHealthTrends(), {
      wrapper: createWrapper(
        '/member-health-trends?teamId=team-1&memberName=Charlie',
      ),
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe(
        'Failed to fetch member health data',
      );
    }
  });

  it('passes the correct params to the gateway including default cycles=5', async () => {
    const gateway = new StubMemberHealthGateway();
    overrideUsecases({
      getMemberHealth: new GetMemberHealthUsecase(gateway),
    });

    renderHook(() => useMemberHealthTrends(), {
      wrapper: createWrapper(
        '/member-health-trends?teamId=team-42&memberName=Alice',
      ),
    });

    await waitFor(() => {
      expect(gateway.calls.length).toBe(1);
    });
    expect(gateway.calls[0]).toEqual({
      teamId: 'team-42',
      memberName: 'Alice',
      cycles: 5,
    });
  });

  it('refetches with updated cycle count when changeCycleCount is called', async () => {
    const gateway = new StubMemberHealthGateway();
    overrideUsecases({
      getMemberHealth: new GetMemberHealthUsecase(gateway),
    });

    const { result } = renderHook(() => useMemberHealthTrends(), {
      wrapper: createWrapper(
        '/member-health-trends?teamId=team-1&memberName=Alice',
      ),
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.changeCycleCount(3);
    });

    await waitFor(() => {
      expect(gateway.calls.some((call) => call.cycles === 3)).toBe(true);
    });
  });

  it('exposes error state when teamId is missing from URL', async () => {
    overrideUsecases({
      getMemberHealth: new GetMemberHealthUsecase(
        new StubMemberHealthGateway(),
      ),
    });

    const { result } = renderHook(() => useMemberHealthTrends(), {
      wrapper: createWrapper('/member-health-trends?memberName=Alice'),
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe(
        'Missing teamId or memberName in URL parameters.',
      );
    }
  });

  it('exposes error state when memberName is missing from URL', async () => {
    overrideUsecases({
      getMemberHealth: new GetMemberHealthUsecase(
        new StubMemberHealthGateway(),
      ),
    });

    const { result } = renderHook(() => useMemberHealthTrends(), {
      wrapper: createWrapper('/member-health-trends?teamId=team-1'),
    });

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe(
        'Missing teamId or memberName in URL parameters.',
      );
    }
  });
});
