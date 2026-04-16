import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useCycleReportUrlState } from '@/modules/analytics/interface-adapters/hooks/use-cycle-report-url-state.ts';

function wrapperFor(initialPath: string) {
  return ({ children }: { children: ReactNode }) => {
    const router = createMemoryRouter(
      [{ path: '/cycle-report', element: <>{children}</> }],
      { initialEntries: [initialPath] },
    );
    return <RouterProvider router={router} />;
  };
}

describe('useCycleReportUrlState', () => {
  it('reads teamId and cycleId from the URL', () => {
    const { result } = renderHook(() => useCycleReportUrlState(), {
      wrapper: wrapperFor('/cycle-report?teamId=team-1&cycleId=cycle-9'),
    });

    expect(result.current.selectedTeamId).toBe('team-1');
    expect(result.current.selectedCycleId).toBe('cycle-9');
  });

  it('returns null for missing teamId and cycleId params', () => {
    const { result } = renderHook(() => useCycleReportUrlState(), {
      wrapper: wrapperFor('/cycle-report'),
    });

    expect(result.current.selectedTeamId).toBeNull();
    expect(result.current.selectedCycleId).toBeNull();
  });

  it('selectTeam writes teamId and clears cycleId in the URL', () => {
    const { result } = renderHook(() => useCycleReportUrlState(), {
      wrapper: wrapperFor('/cycle-report?teamId=team-old&cycleId=cycle-old'),
    });

    act(() => {
      result.current.selectTeam('team-new');
    });

    expect(result.current.selectedTeamId).toBe('team-new');
    expect(result.current.selectedCycleId).toBeNull();
  });

  it('selectCycle writes cycleId while preserving teamId', () => {
    const { result } = renderHook(() => useCycleReportUrlState(), {
      wrapper: wrapperFor('/cycle-report?teamId=team-1'),
    });

    act(() => {
      result.current.selectCycle('cycle-1');
    });

    expect(result.current.selectedTeamId).toBe('team-1');
    expect(result.current.selectedCycleId).toBe('cycle-1');
  });

  it('reads memberName from the URL', () => {
    const { result } = renderHook(() => useCycleReportUrlState(), {
      wrapper: wrapperFor(
        '/cycle-report?teamId=team-1&cycleId=cycle-1&memberName=Alice',
      ),
    });

    expect(result.current.selectedMemberName).toBe('Alice');
  });

  it('returns null for a missing memberName param', () => {
    const { result } = renderHook(() => useCycleReportUrlState(), {
      wrapper: wrapperFor('/cycle-report?teamId=team-1'),
    });

    expect(result.current.selectedMemberName).toBeNull();
  });

  it('selectMember writes memberName while preserving teamId and cycleId', () => {
    const { result } = renderHook(() => useCycleReportUrlState(), {
      wrapper: wrapperFor('/cycle-report?teamId=team-1&cycleId=cycle-1'),
    });

    act(() => {
      result.current.selectMember('Alice');
    });

    expect(result.current.selectedMemberName).toBe('Alice');
    expect(result.current.selectedTeamId).toBe('team-1');
    expect(result.current.selectedCycleId).toBe('cycle-1');
  });

  it('selectMember with null clears the memberName param', () => {
    const { result } = renderHook(() => useCycleReportUrlState(), {
      wrapper: wrapperFor(
        '/cycle-report?teamId=team-1&cycleId=cycle-1&memberName=Alice',
      ),
    });

    act(() => {
      result.current.selectMember(null);
    });

    expect(result.current.selectedMemberName).toBeNull();
    expect(result.current.selectedTeamId).toBe('team-1');
    expect(result.current.selectedCycleId).toBe('cycle-1');
  });

  it('selectTeam also clears memberName to avoid leaking cross-team member filter', () => {
    const { result } = renderHook(() => useCycleReportUrlState(), {
      wrapper: wrapperFor(
        '/cycle-report?teamId=team-old&cycleId=cycle-old&memberName=Alice',
      ),
    });

    act(() => {
      result.current.selectTeam('team-new');
    });

    expect(result.current.selectedTeamId).toBe('team-new');
    expect(result.current.selectedCycleId).toBeNull();
    expect(result.current.selectedMemberName).toBeNull();
  });
});
