import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type Locale, useLocale, useSetLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import {
  SettingsPresenter,
  type SettingsPresenterInput,
} from '../presenters/settings.presenter.ts';
import { settingsTranslations } from '../presenters/settings.translations.ts';
import {
  type SettingsViewModel,
  type WorkflowStatusTag,
} from '../presenters/settings.view-model.schema.ts';

const TOAST_DURATION_MS = 2500;

export type SettingsState = AsyncState<SettingsViewModel>;

export interface UseSettingsResult {
  state: SettingsState;
  onLanguageChange: (language: string) => void;
  onTeamSelect: (teamId: string) => void;
  onTimezoneChange: (timezone: string) => void;
  onStatusToggle: (statusName: string) => void;
  onWorkflowTagChange: (statusName: string, tag: WorkflowStatusTag) => void;
  onWorkflowSave: () => Promise<void>;
}

export function useSettings(): UseSettingsResult {
  const locale = useLocale();
  const setLocale = useSetLocale();
  const queryClient = useQueryClient();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingWorkflowTags, setPendingWorkflowTags] = useState<
    Map<string, WorkflowStatusTag>
  >(new Map());
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translations = settingsTranslations[locale];
  const presenter = useMemo(() => new SettingsPresenter(), []);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, TOAST_DURATION_MS);
  }, []);

  const languageQuery = useQuery({
    queryKey: ['settings', 'language'],
    queryFn: () => usecases.getWorkspaceLanguage.execute(),
  });

  const teamsQuery = useQuery({
    queryKey: ['settings', 'available-teams'],
    queryFn: () => usecases.listAvailableTeams.execute(),
  });

  const timezoneQuery = useQuery({
    queryKey: ['settings', 'timezone', selectedTeamId],
    queryFn: () => usecases.getTeamTimezone.execute(selectedTeamId ?? ''),
    enabled: selectedTeamId !== null,
  });

  const statusSettingsQuery = useQuery({
    queryKey: ['settings', 'status-settings', selectedTeamId],
    queryFn: () => usecases.getTeamStatusSettings.execute(selectedTeamId ?? ''),
    enabled: selectedTeamId !== null,
  });

  const driftGridQuery = useQuery({
    queryKey: ['settings', 'drift-grid'],
    queryFn: () => usecases.getDriftGridEntries.execute(),
  });

  const workflowConfigQuery = useQuery({
    queryKey: ['settings', 'workflow-config', selectedTeamId],
    queryFn: () => usecases.getTeamWorkflowConfig.execute(selectedTeamId ?? ''),
    enabled: selectedTeamId !== null,
  });

  const languageMutation = useMutation({
    mutationFn: (language: string) =>
      usecases.setWorkspaceLanguage.execute({ language }),
    onSuccess: (_data, language) => {
      if (language === 'en' || language === 'fr') {
        setLocale(language as Locale);
      }
      queryClient.invalidateQueries({ queryKey: ['settings', 'language'] });
      showToast(
        settingsTranslations[language === 'fr' ? 'fr' : 'en']
          .toastLanguageSaved,
      );
    },
  });

  const timezoneMutation = useMutation({
    mutationFn: (timezone: string) =>
      usecases.setTeamTimezone.execute({
        teamId: selectedTeamId ?? '',
        timezone,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['settings', 'timezone', selectedTeamId],
      });
      showToast(translations.toastTimezoneSaved);
    },
  });

  const excludedStatusesMutation = useMutation({
    mutationFn: (statuses: string[]) =>
      usecases.setTeamExcludedStatuses.execute({
        teamId: selectedTeamId ?? '',
        statuses,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['settings', 'status-settings', selectedTeamId],
      });
      showToast(translations.toastStatusSaved);
    },
  });

  const workflowConfigMutation = useMutation({
    mutationFn: (input: {
      startedStatuses: string[];
      completedStatuses: string[];
    }) =>
      usecases.setTeamWorkflowConfig.execute({
        teamId: selectedTeamId ?? '',
        startedStatuses: input.startedStatuses,
        completedStatuses: input.completedStatuses,
      }),
    onSuccess: () => {
      setPendingWorkflowTags(new Map());
      queryClient.invalidateQueries({
        queryKey: ['settings', 'workflow-config', selectedTeamId],
      });
      showToast(translations.toastWorkflowSaved);
    },
    onError: () => {
      showToast(translations.toastWorkflowError);
    },
  });

  const onLanguageChange = useCallback(
    (language: string) => {
      languageMutation.mutate(language);
    },
    [languageMutation],
  );

  const onTeamSelect = useCallback((teamId: string) => {
    setSelectedTeamId(teamId);
    setPendingWorkflowTags(new Map());
  }, []);

  const onTimezoneChange = useCallback(
    (timezone: string) => {
      timezoneMutation.mutate(timezone);
    },
    [timezoneMutation],
  );

  const onStatusToggle = useCallback(
    (statusName: string) => {
      const currentExcluded = statusSettingsQuery.data?.excludedStatuses ?? [];
      const isCurrentlyExcluded = currentExcluded.includes(statusName);
      const newExcluded = isCurrentlyExcluded
        ? currentExcluded.filter((name) => name !== statusName)
        : [...currentExcluded, statusName];
      excludedStatusesMutation.mutate(newExcluded);
    },
    [statusSettingsQuery.data, excludedStatusesMutation],
  );

  const onWorkflowTagChange = useCallback(
    (statusName: string, tag: WorkflowStatusTag) => {
      setPendingWorkflowTags((previous) => {
        const next = new Map(previous);
        next.set(statusName, tag);
        return next;
      });
    },
    [],
  );

  const onWorkflowSave = useCallback(async () => {
    const persisted = workflowConfigQuery.data;
    if (persisted === undefined) return;
    const mergedTags = new Map<string, WorkflowStatusTag>();
    for (const statusName of persisted.knownStatuses) {
      const pending = pendingWorkflowTags.get(statusName);
      if (pending !== undefined) {
        mergedTags.set(statusName, pending);
        continue;
      }
      if (persisted.startedStatuses.includes(statusName)) {
        mergedTags.set(statusName, 'started');
        continue;
      }
      if (persisted.completedStatuses.includes(statusName)) {
        mergedTags.set(statusName, 'completed');
        continue;
      }
      mergedTags.set(statusName, 'not_tracked');
    }

    const startedStatuses: string[] = [];
    const completedStatuses: string[] = [];
    for (const [statusName, tag] of mergedTags) {
      if (tag === 'started') startedStatuses.push(statusName);
      if (tag === 'completed') completedStatuses.push(statusName);
    }

    try {
      await workflowConfigMutation.mutateAsync({
        startedStatuses,
        completedStatuses,
      });
    } catch {
      // error toast handled in onError; swallow so hook callers don't crash
    }
  }, [workflowConfigQuery.data, pendingWorkflowTags, workflowConfigMutation]);

  const isInitialLoading =
    languageQuery.isPending || teamsQuery.isPending || driftGridQuery.isPending;

  if (isInitialLoading) {
    return {
      state: { status: 'loading' },
      onLanguageChange,
      onTeamSelect,
      onTimezoneChange,
      onStatusToggle,
      onWorkflowTagChange,
      onWorkflowSave,
    };
  }

  const hasError =
    languageQuery.isError || teamsQuery.isError || driftGridQuery.isError;

  if (hasError) {
    return {
      state: {
        status: 'error',
        message:
          languageQuery.error?.message ??
          teamsQuery.error?.message ??
          driftGridQuery.error?.message ??
          'Unknown error',
      },
      onLanguageChange,
      onTeamSelect,
      onTimezoneChange,
      onStatusToggle,
      onWorkflowTagChange,
      onWorkflowSave,
    };
  }

  const presenterInput: SettingsPresenterInput = {
    locale,
    currentLanguage: languageQuery.data?.language ?? 'en',
    teams:
      teamsQuery.data?.map((team) => ({
        teamId: team.teamId,
        teamName: team.teamName,
      })) ?? null,
    selectedTeamId,
    timezone: timezoneQuery.data?.timezone ?? null,
    availableStatuses: statusSettingsQuery.data?.availableStatuses ?? null,
    excludedStatuses: statusSettingsQuery.data?.excludedStatuses ?? null,
    driftGridEntries: driftGridQuery.data ?? null,
    workflowConfig: workflowConfigQuery.data ?? null,
    pendingWorkflowTags:
      pendingWorkflowTags.size === 0 ? null : pendingWorkflowTags,
    toastMessage,
  };

  return {
    state: { status: 'ready', data: presenter.present(presenterInput) },
    onLanguageChange,
    onTeamSelect,
    onTimezoneChange,
    onStatusToggle,
    onWorkflowTagChange,
    onWorkflowSave,
  };
}
