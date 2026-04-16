import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useMemberDigest } from '@/modules/analytics/interface-adapters/hooks/use-member-digest.ts';
import { StubMemberDigestGateway } from '@/modules/analytics/testing/good-path/stub.member-digest.in-memory.gateway.ts';
import { GenerateMemberDigestUsecase } from '@/modules/analytics/usecases/generate-member-digest.usecase.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function wrapper({ children }: { children: ReactNode }) {
  return withQueryClient(children, createTestQueryClient());
}

function overrideMemberDigestUsecase(gateway: StubMemberDigestGateway) {
  overrideUsecases({
    generateMemberDigest: new GenerateMemberDigestUsecase(gateway),
  });
}

describe('useMemberDigest', () => {
  let writeTextMock: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;

  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    });
  });

  afterEach(() => {
    resetUsecases();
    vi.restoreAllMocks();
  });

  it('exposes a ready state with showGenerateButton true before any generation', () => {
    overrideMemberDigestUsecase(new StubMemberDigestGateway({}));

    const { result } = renderHook(
      () =>
        useMemberDigest({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          memberName: 'Alice',
        }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('ready');
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.showGenerateButton).toBe(true);
      expect(result.current.state.data.showDigest).toBe(false);
      expect(result.current.state.data.memberName).toBe('Alice');
    }
  });

  it('transitions to showDigest after a successful generate with non-null digest', async () => {
    const gateway = new StubMemberDigestGateway({
      digestByMember: { Alice: '# Alice report' },
    });
    overrideMemberDigestUsecase(gateway);

    const { result } = renderHook(
      () =>
        useMemberDigest({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          memberName: 'Alice',
        }),
      { wrapper },
    );

    act(() => {
      result.current.generate();
    });

    await waitFor(() => {
      if (result.current.state.status === 'ready') {
        expect(result.current.state.data.showDigest).toBe(true);
        expect(result.current.state.data.digestMarkdown).toBe('# Alice report');
      } else {
        throw new Error('expected ready state');
      }
    });
  });

  it('transitions to showEmpty after a successful generate with null digest', async () => {
    const gateway = new StubMemberDigestGateway({
      digestByMember: { Alice: null },
    });
    overrideMemberDigestUsecase(gateway);

    const { result } = renderHook(
      () =>
        useMemberDigest({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          memberName: 'Alice',
        }),
      { wrapper },
    );

    act(() => {
      result.current.generate();
    });

    await waitFor(() => {
      if (result.current.state.status === 'ready') {
        expect(result.current.state.data.showEmpty).toBe(true);
        expect(result.current.state.data.showDigest).toBe(false);
      } else {
        throw new Error('expected ready state');
      }
    });
  });

  it('writes the digest markdown to the clipboard when copyToClipboard is invoked', async () => {
    const gateway = new StubMemberDigestGateway({
      digestByMember: { Alice: '# Copy me' },
    });
    overrideMemberDigestUsecase(gateway);

    const { result } = renderHook(
      () =>
        useMemberDigest({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          memberName: 'Alice',
        }),
      { wrapper },
    );

    act(() => {
      result.current.generate();
    });

    await waitFor(() => {
      if (result.current.state.status === 'ready') {
        expect(result.current.state.data.showDigest).toBe(true);
      }
    });

    await act(async () => {
      result.current.copyToClipboard();
    });

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('# Copy me');
    });
  });

  it('sets a copy confirmation string on the view model after a successful copy', async () => {
    const gateway = new StubMemberDigestGateway({
      digestByMember: { Alice: '# Content' },
    });
    overrideMemberDigestUsecase(gateway);

    const { result } = renderHook(
      () =>
        useMemberDigest({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          memberName: 'Alice',
        }),
      { wrapper },
    );

    act(() => {
      result.current.generate();
    });

    await waitFor(() => {
      if (result.current.state.status === 'ready') {
        expect(result.current.state.data.showDigest).toBe(true);
      }
    });

    await act(async () => {
      result.current.copyToClipboard();
    });

    await waitFor(() => {
      if (result.current.state.status === 'ready') {
        expect(result.current.state.data.copyConfirmation).toBe(
          'Digest copied!',
        );
      } else {
        throw new Error('expected ready state');
      }
    });
  });

  it('resets digest state when memberName changes', async () => {
    const gateway = new StubMemberDigestGateway({
      digestByMember: { Alice: '# Alice report' },
    });
    overrideMemberDigestUsecase(gateway);

    const { result, rerender } = renderHook(
      (props: { memberName: string }) =>
        useMemberDigest({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          memberName: props.memberName,
        }),
      { wrapper, initialProps: { memberName: 'Alice' } },
    );

    act(() => {
      result.current.generate();
    });

    await waitFor(() => {
      if (result.current.state.status === 'ready') {
        expect(result.current.state.data.showDigest).toBe(true);
      }
    });

    rerender({ memberName: 'Bob' });

    await waitFor(() => {
      if (result.current.state.status === 'ready') {
        expect(result.current.state.data.showGenerateButton).toBe(true);
        expect(result.current.state.data.showDigest).toBe(false);
        expect(result.current.state.data.memberName).toBe('Bob');
      }
    });
  });
});
