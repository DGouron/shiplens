import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { type SprintReportDetailResponse } from '../../entities/sprint-report/sprint-report.response.ts';
import { AiReportPresenter } from '../presenters/ai-report.presenter.ts';
import { aiReportTranslations } from '../presenters/ai-report.translations.ts';
import { type AiReportViewModel } from '../presenters/ai-report.view-model.schema.ts';

export interface UseAiReportParams {
  teamId: string | null;
  cycleId: string | null;
}

export type AiReportState = AsyncState<AiReportViewModel>;

export interface UseAiReportResult {
  state: AiReportState;
  generate: () => void;
  exportMarkdown: () => void;
  copyToClipboard: () => void;
}

const COPY_CONFIRMATION_TIMEOUT_MS = 2000;

export function useAiReport(params: UseAiReportParams): UseAiReportResult {
  const locale = useLocale();
  const { teamId, cycleId } = params;
  const queryClient = useQueryClient();
  const [copyConfirmation, setCopyConfirmation] = useState<string | null>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const historyEnabled = teamId !== null;

  const historyQuery = useQuery({
    queryKey: ['analytics', 'sprint-reports', 'history', teamId],
    queryFn: () => {
      if (teamId === null) {
        return Promise.reject(new Error('useAiReport: teamId is required'));
      }
      return usecases.listSprintReports.execute({ teamId });
    },
    enabled: historyEnabled,
  });

  const matchedReportId = useMemo<string | null>(() => {
    if (historyQuery.data === undefined) return null;
    if (cycleId === null) return null;
    const match = historyQuery.data.reports.find(
      (report) => report.cycleId === cycleId,
    );
    return match?.id ?? null;
  }, [historyQuery.data, cycleId]);

  const detailEnabled = matchedReportId !== null;

  const detailQuery = useQuery({
    queryKey: ['analytics', 'sprint-reports', 'detail', matchedReportId],
    queryFn: () => {
      if (matchedReportId === null) {
        return Promise.reject(
          new Error('useAiReport: matchedReportId is required'),
        );
      }
      return usecases.getSprintReportDetail.execute({
        reportId: matchedReportId,
      });
    },
    enabled: detailEnabled,
  });

  const generateMutation = useMutation({
    mutationFn: () => {
      if (teamId === null || cycleId === null) {
        return Promise.reject(
          new Error('useAiReport: teamId and cycleId are required to generate'),
        );
      }
      return usecases.generateSprintReport.execute({ teamId, cycleId });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['analytics', 'sprint-reports', 'history', teamId],
      });
    },
  });

  const translations = aiReportTranslations[locale];
  const presenter = useMemo(
    () => new AiReportPresenter(translations),
    [translations],
  );

  const detail: SprintReportDetailResponse | null =
    detailQuery.data !== undefined ? detailQuery.data : null;

  const state: AiReportState = (() => {
    if (!historyEnabled || historyQuery.isPending) {
      return { status: 'loading' };
    }
    if (historyQuery.isError) {
      return {
        status: 'error',
        message: extractMessage(historyQuery.error, translations.errorLabel),
      };
    }
    if (detailEnabled && detailQuery.isPending) {
      return { status: 'loading' };
    }
    if (detailEnabled && detailQuery.isError) {
      return {
        status: 'error',
        message: extractMessage(detailQuery.error, translations.errorLabel),
      };
    }
    return {
      status: 'ready',
      data: presenter.present({
        detail,
        isGenerating: generateMutation.isPending,
        copyConfirmation,
      }),
    };
  })();

  const generate = useCallback(() => {
    generateMutation.mutate();
  }, [generateMutation]);

  const triggerCopyConfirmation = useCallback(() => {
    if (copyTimeoutRef.current !== null) {
      clearTimeout(copyTimeoutRef.current);
    }
    setCopyConfirmation(translations.copyConfirmation);
    copyTimeoutRef.current = setTimeout(() => {
      setCopyConfirmation(null);
      copyTimeoutRef.current = null;
    }, COPY_CONFIRMATION_TIMEOUT_MS);
  }, [translations.copyConfirmation]);

  const exportMarkdown = useCallback(() => {
    if (detail === null) return;
    const filename = presenter.present({
      detail,
      isGenerating: false,
      copyConfirmation: null,
    }).exportFilename;
    const blob = new Blob([detail.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [detail, presenter]);

  const copyToClipboard = useCallback(() => {
    if (detail === null) return;
    void navigator.clipboard.writeText(detail.markdown).then(() => {
      triggerCopyConfirmation();
    });
  }, [detail, triggerCopyConfirmation]);

  return { state, generate, exportMarkdown, copyToClipboard };
}

function extractMessage(error: unknown, fallback: string): string {
  if (error instanceof GatewayError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}
