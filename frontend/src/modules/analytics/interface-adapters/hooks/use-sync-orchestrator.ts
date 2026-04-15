import { useCallback, useRef, useState } from 'react';
import { usecases } from '@/main/dependencies.ts';

export type SyncStep = 'teams' | 'selection' | 'reference' | 'issues';

export type SyncState =
  | { status: 'idle' }
  | { status: 'running'; step: SyncStep; attempt: number }
  | { status: 'succeeded' }
  | { status: 'failed'; error: string };

type LastFlow = 'auto' | 'resync' | null;

export interface UseSyncOrchestratorOptions {
  onSuccess?: () => void | Promise<void>;
}

export interface UseSyncOrchestratorResult {
  state: SyncState;
  startAutoSync: () => Promise<void>;
  startResync: () => Promise<void>;
  retry: () => Promise<void>;
}

const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unexpected sync error';
}

export function useSyncOrchestrator(
  options: UseSyncOrchestratorOptions = {},
): UseSyncOrchestratorResult {
  const [state, setState] = useState<SyncState>({ status: 'idle' });
  const lastFlowRef = useRef<LastFlow>(null);
  const onSuccessRef = useRef(options.onSuccess);
  onSuccessRef.current = options.onSuccess;

  const runAutoSyncAttempt = useCallback(async (attempt: number) => {
    setState({ status: 'running', step: 'teams', attempt });
    const availableTeams = await usecases.discoverSyncTeams.execute();
    setState({ status: 'running', step: 'selection', attempt });
    await usecases.selectAllSyncTargets.execute({ availableTeams });
    setState({ status: 'running', step: 'reference', attempt });
    await usecases.syncReferenceData.execute();
    setState({ status: 'running', step: 'issues', attempt });
    for (const team of availableTeams) {
      await usecases.syncTeamIssues.execute({ teamId: team.teamId });
    }
  }, []);

  const runResyncAttempt = useCallback(async (attempt: number) => {
    setState({ status: 'running', step: 'selection', attempt });
    const selection = await usecases.getSyncSelection.execute();
    if (selection === null) {
      throw new Error('No sync selection found');
    }
    setState({ status: 'running', step: 'reference', attempt });
    await usecases.syncReferenceData.execute();
    setState({ status: 'running', step: 'issues', attempt });
    for (const team of selection.selectedTeams) {
      await usecases.syncTeamIssues.execute({ teamId: team.teamId });
    }
  }, []);

  const runWithRetry = useCallback(
    async (task: (attempt: number) => Promise<void>) => {
      let lastError: unknown = null;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        try {
          await task(attempt);
          setState({ status: 'succeeded' });
          const callback = onSuccessRef.current;
          if (callback !== undefined) {
            await callback();
          }
          return;
        } catch (error) {
          lastError = error;
          if (attempt < MAX_ATTEMPTS) {
            await sleep(BASE_DELAY_MS * 2 ** (attempt - 1));
          }
        }
      }
      setState({ status: 'failed', error: extractErrorMessage(lastError) });
    },
    [],
  );

  const runOnceWithoutRetry = useCallback(
    async (task: (attempt: number) => Promise<void>) => {
      try {
        await task(1);
        setState({ status: 'succeeded' });
        const callback = onSuccessRef.current;
        if (callback !== undefined) {
          await callback();
        }
      } catch (error) {
        setState({ status: 'failed', error: extractErrorMessage(error) });
      }
    },
    [],
  );

  const startAutoSync = useCallback(async () => {
    lastFlowRef.current = 'auto';
    await runWithRetry(runAutoSyncAttempt);
  }, [runWithRetry, runAutoSyncAttempt]);

  const startResync = useCallback(async () => {
    lastFlowRef.current = 'resync';
    await runOnceWithoutRetry(runResyncAttempt);
  }, [runOnceWithoutRetry, runResyncAttempt]);

  const retry = useCallback(async () => {
    if (lastFlowRef.current === 'auto') {
      await runWithRetry(runAutoSyncAttempt);
      return;
    }
    if (lastFlowRef.current === 'resync') {
      await runOnceWithoutRetry(runResyncAttempt);
    }
  }, [runWithRetry, runOnceWithoutRetry, runAutoSyncAttempt, runResyncAttempt]);

  return { state, startAutoSync, startResync, retry };
}
