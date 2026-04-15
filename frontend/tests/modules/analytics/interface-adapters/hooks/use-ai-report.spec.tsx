import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useAiReport } from '@/modules/analytics/interface-adapters/hooks/use-ai-report.ts';
import { FailingSprintReportGateway } from '@/modules/analytics/testing/bad-path/failing.sprint-report.in-memory.gateway.ts';
import { StubSprintReportGateway } from '@/modules/analytics/testing/good-path/stub.sprint-report.in-memory.gateway.ts';
import { GenerateSprintReportUsecase } from '@/modules/analytics/usecases/generate-sprint-report.usecase.ts';
import { GetSprintReportDetailUsecase } from '@/modules/analytics/usecases/get-sprint-report-detail.usecase.ts';
import { ListSprintReportsUsecase } from '@/modules/analytics/usecases/list-sprint-reports.usecase.ts';
import { SprintReportDetailBuilder } from '../../../../builders/sprint-report-detail.builder.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function wrapper({ children }: { children: ReactNode }) {
  return withQueryClient(children, createTestQueryClient());
}

function overrideSprintReportUsecases(
  gateway: StubSprintReportGateway | FailingSprintReportGateway,
) {
  overrideUsecases({
    listSprintReports: new ListSprintReportsUsecase(gateway),
    getSprintReportDetail: new GetSprintReportDetailUsecase(gateway),
    generateSprintReport: new GenerateSprintReportUsecase(gateway),
  });
}

describe('useAiReport', () => {
  let writeTextMock: ReturnType<typeof vi.fn<(text: string) => Promise<void>>>;
  let createObjectUrlMock: ReturnType<typeof vi.fn<(blob: Blob) => string>>;
  let revokeObjectUrlMock: ReturnType<typeof vi.fn<(url: string) => void>>;
  let anchorClickMock: ReturnType<typeof vi.fn<() => void>>;
  let originalCreateElement: typeof document.createElement;

  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: writeTextMock },
    });

    createObjectUrlMock = vi.fn().mockReturnValue('blob:mock-url');
    revokeObjectUrlMock = vi.fn();
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: createObjectUrlMock,
      revokeObjectURL: revokeObjectUrlMock,
    });

    anchorClickMock = vi.fn();
    originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(
      (tagName: string) => {
        const element = originalCreateElement(tagName);
        if (tagName === 'a') {
          element.click = () => {
            anchorClickMock();
          };
        }
        return element;
      },
    );
  });

  afterEach(() => {
    resetUsecases();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('exposes a loading state on first render when teamId is provided', () => {
    overrideSprintReportUsecases(new StubSprintReportGateway());

    const { result } = renderHook(
      () =>
        useAiReport({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          cycleName: 'Cycle 1',
        }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
  });

  it('transitions to ready with showEmpty when the team has no matching report', async () => {
    overrideSprintReportUsecases(
      new StubSprintReportGateway({
        details: [],
        teamIdToReportIds: { 'team-1': [] },
      }),
    );

    const { result } = renderHook(
      () =>
        useAiReport({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          cycleName: 'Cycle 1',
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.showEmpty).toBe(true);
      expect(result.current.state.data.showReport).toBe(false);
    }
  });

  it('transitions to ready with showReport and the markdown when a report matches the cycle', async () => {
    const detail = new SprintReportDetailBuilder()
      .withId('report-1')
      .withCycleName('Cycle 1')
      .withMarkdown('# Cycle 1\n\nDone.')
      .build();
    overrideSprintReportUsecases(
      new StubSprintReportGateway({
        details: [detail],
        teamIdToReportIds: { 'team-1': ['report-1'] },
      }),
    );

    const { result } = renderHook(
      () =>
        useAiReport({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          cycleName: 'Cycle 1',
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(result.current.state.data.showReport).toBe(true);
      expect(result.current.state.data.reportMarkdown).toBe(
        '# Cycle 1\n\nDone.',
      );
    }
  });

  it('transitions to error when the history gateway fails', async () => {
    overrideSprintReportUsecases(new FailingSprintReportGateway());

    const { result } = renderHook(
      () =>
        useAiReport({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          cycleName: 'Cycle 1',
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
  });

  it('stays loading and never fetches when teamId is null', () => {
    const gateway = new StubSprintReportGateway();
    overrideSprintReportUsecases(gateway);

    const { result } = renderHook(
      () => useAiReport({ teamId: null, cycleId: null, cycleName: null }),
      { wrapper },
    );

    expect(result.current.state.status).toBe('loading');
    expect(gateway.listCalls).toEqual([]);
  });

  it('invalidates the history query after a successful generate call', async () => {
    const gateway = new StubSprintReportGateway({
      details: [],
      teamIdToReportIds: { 'team-1': [] },
    });
    overrideSprintReportUsecases(gateway);

    const { result } = renderHook(
      () =>
        useAiReport({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          cycleName: 'Cycle cycle-1',
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.generate();
    });

    await waitFor(() => {
      expect(gateway.generateCalls).toEqual([
        { teamId: 'team-1', cycleId: 'cycle-1' },
      ]);
    });
    await waitFor(() => {
      if (result.current.state.status === 'ready') {
        expect(result.current.state.data.showReport).toBe(true);
      } else {
        throw new Error('expected ready state');
      }
    });
  });

  it('writes the markdown to the clipboard when copyToClipboard is invoked', async () => {
    const detail = new SprintReportDetailBuilder()
      .withId('report-1')
      .withCycleName('Cycle 1')
      .withMarkdown('# Cycle 1\n\nClip me.')
      .build();
    overrideSprintReportUsecases(
      new StubSprintReportGateway({
        details: [detail],
        teamIdToReportIds: { 'team-1': ['report-1'] },
      }),
    );

    const { result } = renderHook(
      () =>
        useAiReport({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          cycleName: 'Cycle 1',
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.copyToClipboard();
    });

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith('# Cycle 1\n\nClip me.');
    });
  });

  it('sets a copy confirmation string on the view model after a successful copy', async () => {
    const detail = new SprintReportDetailBuilder()
      .withId('report-1')
      .withCycleName('Cycle 1')
      .build();
    overrideSprintReportUsecases(
      new StubSprintReportGateway({
        details: [detail],
        teamIdToReportIds: { 'team-1': ['report-1'] },
      }),
    );

    const { result } = renderHook(
      () =>
        useAiReport({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          cycleName: 'Cycle 1',
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    await act(async () => {
      result.current.copyToClipboard();
    });

    await waitFor(() => {
      if (result.current.state.status === 'ready') {
        expect(result.current.state.data.copyConfirmation).toBe(
          'Report copied!',
        );
      } else {
        throw new Error('expected ready state');
      }
    });
  });

  it('downloads the markdown as a blob when exportMarkdown is invoked', async () => {
    const detail = new SprintReportDetailBuilder()
      .withId('report-1')
      .withCycleName('Cycle 1')
      .withMarkdown('# Export me')
      .build();
    overrideSprintReportUsecases(
      new StubSprintReportGateway({
        details: [detail],
        teamIdToReportIds: { 'team-1': ['report-1'] },
      }),
    );

    const { result } = renderHook(
      () =>
        useAiReport({
          teamId: 'team-1',
          cycleId: 'cycle-1',
          cycleName: 'Cycle 1',
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });

    act(() => {
      result.current.exportMarkdown();
    });

    expect(createObjectUrlMock).toHaveBeenCalledTimes(1);
    expect(anchorClickMock).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrlMock).toHaveBeenCalledWith('blob:mock-url');
  });
});
