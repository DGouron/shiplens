import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useSettings } from '@/modules/analytics/interface-adapters/hooks/use-settings.ts';
import { FailingWorkflowConfigGateway } from '@/modules/analytics/testing/bad-path/failing.workflow-config.in-memory.gateway.ts';
import { StubDriftGridGateway } from '@/modules/analytics/testing/good-path/stub.drift-grid.in-memory.gateway.ts';
import { StubWorkflowConfigGateway } from '@/modules/analytics/testing/good-path/stub.workflow-config.in-memory.gateway.ts';
import { StubWorkspaceLanguageGateway } from '@/modules/analytics/testing/good-path/stub.workspace-language.in-memory.gateway.ts';
import { GetDriftGridEntriesUsecase } from '@/modules/analytics/usecases/get-drift-grid-entries.usecase.ts';
import { GetTeamWorkflowConfigUsecase } from '@/modules/analytics/usecases/get-team-workflow-config.usecase.ts';
import { GetWorkspaceLanguageUsecase } from '@/modules/analytics/usecases/get-workspace-language.usecase.ts';
import { ListAvailableTeamsUsecase } from '@/modules/analytics/usecases/list-available-teams.usecase.ts';
import { SetTeamWorkflowConfigUsecase } from '@/modules/analytics/usecases/set-team-workflow-config.usecase.ts';
import { StubSyncGateway } from '@/modules/synchronization/testing/good-path/stub.sync.in-memory.gateway.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../helpers/query-client-wrapper.tsx';

function renderUseSettings() {
  const client = createTestQueryClient();
  return renderHook(() => useSettings(), {
    wrapper: ({ children }) => withQueryClient(children, client),
  });
}

function installBasicSettingsStubs(): StubWorkflowConfigGateway {
  const workflowGateway = new StubWorkflowConfigGateway();
  const languageGateway = new StubWorkspaceLanguageGateway();
  const driftGridGateway = new StubDriftGridGateway();
  const syncGateway = new StubSyncGateway({
    availableTeams: [
      {
        teamId: 'team-1',
        teamName: 'Team One',
        projects: [],
      },
      {
        teamId: 'team-2',
        teamName: 'Team Two',
        projects: [],
      },
    ],
  });
  overrideUsecases({
    getTeamWorkflowConfig: new GetTeamWorkflowConfigUsecase(workflowGateway),
    setTeamWorkflowConfig: new SetTeamWorkflowConfigUsecase(workflowGateway),
    getWorkspaceLanguage: new GetWorkspaceLanguageUsecase(languageGateway),
    getDriftGridEntries: new GetDriftGridEntriesUsecase(driftGridGateway),
    listAvailableTeams: new ListAvailableTeamsUsecase(syncGateway),
  });
  return workflowGateway;
}

async function selectTeam(
  result: ReturnType<typeof renderUseSettings>['result'],
  teamId: string,
) {
  await act(async () => {
    result.current.onTeamSelect(teamId);
  });
}

async function waitReady(
  result: ReturnType<typeof renderUseSettings>['result'],
) {
  await waitFor(() => {
    expect(result.current.state.status).toBe('ready');
  });
}

describe('Configure workflow statuses UI (acceptance)', () => {
  afterEach(() => {
    resetUsecases();
  });

  describe('the section lists every distinct status name from transition history and tags each one', () => {
    it('auto-detected load standard: "In Progress" started, "Done" completed, others not tracked, badge "auto-detected"', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: ['In Progress'],
        completedStatuses: ['Done'],
        source: 'auto-detected',
        knownStatuses: ['Backlog', 'Todo', 'In Progress', 'Done'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');

      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });
      if (result.current.state.status !== 'ready') throw new Error('not ready');
      const section = result.current.state.data.workflowConfig;
      expect(section.isAutoDetected).toBe(true);
      expect(section.isManual).toBe(false);
      const inProgressRow = section.rows.find(
        (row) => row.statusName === 'In Progress',
      );
      const doneRow = section.rows.find((row) => row.statusName === 'Done');
      const backlogRow = section.rows.find(
        (row) => row.statusName === 'Backlog',
      );
      expect(inProgressRow?.tag).toBe('started');
      expect(doneRow?.tag).toBe('completed');
      expect(backlogRow?.tag).toBe('not_tracked');
    });

    it('auto-detected load custom: "In Dev" started, "Done" completed, "In Review" not tracked', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: ['In Dev'],
        completedStatuses: ['Done'],
        source: 'auto-detected',
        knownStatuses: ['In Dev', 'In Review', 'Done'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');

      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });
      if (result.current.state.status !== 'ready') throw new Error('not ready');
      const section = result.current.state.data.workflowConfig;
      const reviewRow = section.rows.find(
        (row) => row.statusName === 'In Review',
      );
      expect(reviewRow?.tag).toBe('not_tracked');
      expect(section.isAutoDetected).toBe(true);
    });

    it('manual load: started=["In Dev"], completed=["Shipped"] → badge "manual"', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: ['In Dev'],
        completedStatuses: ['Shipped'],
        source: 'manual',
        knownStatuses: ['In Dev', 'Review', 'Shipped'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');

      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });
      if (result.current.state.status !== 'ready') throw new Error('not ready');
      const section = result.current.state.data.workflowConfig;
      expect(section.isManual).toBe(true);
      expect(section.isAutoDetected).toBe(false);
      const inDevRow = section.rows.find((row) => row.statusName === 'In Dev');
      const shippedRow = section.rows.find(
        (row) => row.statusName === 'Shipped',
      );
      expect(inDevRow?.tag).toBe('started');
      expect(shippedRow?.tag).toBe('completed');
    });
  });

  describe('user-driven tag changes update rows and enable save', () => {
    it('tag started: setting "In Review" to started marks the row and enables save', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: [],
        completedStatuses: [],
        source: 'auto-detected',
        knownStatuses: ['In Review'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');
      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });

      await act(async () => {
        result.current.onWorkflowTagChange('In Review', 'started');
      });

      if (result.current.state.status !== 'ready') throw new Error('not ready');
      const section = result.current.state.data.workflowConfig;
      const reviewRow = section.rows.find(
        (row) => row.statusName === 'In Review',
      );
      expect(reviewRow?.tag).toBe('started');
      expect(section.canSave).toBe(true);
    });

    it('tag completed: setting "Phase3" to completed marks the row and enables save', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: [],
        completedStatuses: [],
        source: 'auto-detected',
        knownStatuses: ['Phase1', 'Phase2', 'Phase3'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');
      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });

      await act(async () => {
        result.current.onWorkflowTagChange('Phase3', 'completed');
      });

      if (result.current.state.status !== 'ready') throw new Error('not ready');
      const section = result.current.state.data.workflowConfig;
      const phase3Row = section.rows.find((row) => row.statusName === 'Phase3');
      expect(phase3Row?.tag).toBe('completed');
      expect(section.canSave).toBe(true);
    });

    it('switch tag: flipping "In Dev" from started to completed updates the row', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: ['In Dev'],
        completedStatuses: [],
        source: 'manual',
        knownStatuses: ['In Dev'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');
      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });

      await act(async () => {
        result.current.onWorkflowTagChange('In Dev', 'completed');
      });

      if (result.current.state.status !== 'ready') throw new Error('not ready');
      const row = result.current.state.data.workflowConfig.rows.find(
        (current) => current.statusName === 'In Dev',
      );
      expect(row?.tag).toBe('completed');
    });

    it('untag: setting "In Dev" from started back to not tracked', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: ['In Dev'],
        completedStatuses: [],
        source: 'manual',
        knownStatuses: ['In Dev'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');
      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });

      await act(async () => {
        result.current.onWorkflowTagChange('In Dev', 'not_tracked');
      });

      if (result.current.state.status !== 'ready') throw new Error('not ready');
      const section = result.current.state.data.workflowConfig;
      const row = section.rows.find(
        (current) => current.statusName === 'In Dev',
      );
      expect(row?.tag).toBe('not_tracked');
      expect(section.canSave).toBe(true);
    });
  });

  describe('save action persistence', () => {
    it('save success: saves the configuration and badge becomes manual', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: [],
        completedStatuses: [],
        source: 'auto-detected',
        knownStatuses: ['In Dev', 'Done'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');
      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });

      await act(async () => {
        result.current.onWorkflowTagChange('In Dev', 'started');
      });
      await act(async () => {
        result.current.onWorkflowTagChange('Done', 'completed');
      });
      await act(async () => {
        await result.current.onWorkflowSave();
      });

      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(result.current.state.data.workflowConfig.isManual).toBe(true);
      });
      if (result.current.state.status !== 'ready') throw new Error('not ready');
      expect(result.current.state.data.workflowConfig.isManual).toBe(true);
      expect(result.current.state.data.workflowConfig.isAutoDetected).toBe(
        false,
      );
    });

    it('save failure: toast error emitted, tags unchanged', async () => {
      const goodGateway = installBasicSettingsStubs();
      goodGateway.configs.set('team-1', {
        startedStatuses: [],
        completedStatuses: [],
        source: 'auto-detected',
        knownStatuses: ['In Dev'],
      });
      const failingGateway = new FailingWorkflowConfigGateway();
      overrideUsecases({
        setTeamWorkflowConfig: new SetTeamWorkflowConfigUsecase(failingGateway),
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');
      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });

      await act(async () => {
        result.current.onWorkflowTagChange('In Dev', 'started');
      });
      await act(async () => {
        await result.current.onWorkflowSave();
      });

      if (result.current.state.status !== 'ready') throw new Error('not ready');
      const row = result.current.state.data.workflowConfig.rows.find(
        (current) => current.statusName === 'In Dev',
      );
      expect(row?.tag).toBe('started');
      expect(result.current.state.data.toastMessage).toBe(
        'Could not save workflow configuration',
      );
    });

    it('reload after save: tags reflect saved manual configuration', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: ['In Dev'],
        completedStatuses: ['Done'],
        source: 'manual',
        knownStatuses: ['In Dev', 'Done'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');

      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });
      if (result.current.state.status !== 'ready') throw new Error('not ready');
      const section = result.current.state.data.workflowConfig;
      expect(section.isManual).toBe(true);
      expect(section.rows.find((row) => row.statusName === 'In Dev')?.tag).toBe(
        'started',
      );
      expect(section.rows.find((row) => row.statusName === 'Done')?.tag).toBe(
        'completed',
      );
    });

    it('save empty configuration: every status set to not tracked and saved', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: ['In Dev'],
        completedStatuses: ['Done'],
        source: 'manual',
        knownStatuses: ['In Dev', 'Done'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');
      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });

      await act(async () => {
        result.current.onWorkflowTagChange('In Dev', 'not_tracked');
      });
      await act(async () => {
        result.current.onWorkflowTagChange('Done', 'not_tracked');
      });
      await act(async () => {
        await result.current.onWorkflowSave();
      });

      expect(gateway.configs.get('team-1')?.startedStatuses).toEqual([]);
      expect(gateway.configs.get('team-1')?.completedStatuses).toEqual([]);
    });
  });

  describe('save button visibility and state', () => {
    it('save action is disabled when there are no pending changes', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: ['In Dev'],
        completedStatuses: ['Done'],
        source: 'manual',
        knownStatuses: ['In Dev', 'Done'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');

      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });
      if (result.current.state.status !== 'ready') throw new Error('not ready');
      expect(result.current.state.data.workflowConfig.canSave).toBe(false);
    });

    it('save action is enabled for an empty configuration once a change is pending', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: ['In Dev'],
        completedStatuses: ['Done'],
        source: 'manual',
        knownStatuses: ['In Dev', 'Done'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');
      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.length,
        ).toBeGreaterThan(0);
      });

      await act(async () => {
        result.current.onWorkflowTagChange('In Dev', 'not_tracked');
      });
      await act(async () => {
        result.current.onWorkflowTagChange('Done', 'not_tracked');
      });

      if (result.current.state.status !== 'ready') throw new Error('not ready');
      expect(result.current.state.data.workflowConfig.canSave).toBe(true);
    });
  });

  describe('empty state and team switching', () => {
    it('empty state: team with zero state transitions shows guidance and no save', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: [],
        completedStatuses: [],
        source: 'auto-detected',
        knownStatuses: [],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');

      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(result.current.state.data.workflowConfig.showEmptyState).toBe(
          true,
        );
      });
      if (result.current.state.status !== 'ready') throw new Error('not ready');
      const section = result.current.state.data.workflowConfig;
      expect(section.showEmptyState).toBe(true);
      expect(section.rows).toHaveLength(0);
      expect(section.canSave).toBe(false);
      expect(section.emptyStateMessage).toContain(
        'No workflow statuses detected',
      );
    });

    it('team switch: selecting a different team reloads the config', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: ['In Dev'],
        completedStatuses: ['Done'],
        source: 'manual',
        knownStatuses: ['In Dev', 'Done'],
      });
      gateway.configs.set('team-2', {
        startedStatuses: ['Phase2'],
        completedStatuses: ['Phase3'],
        source: 'manual',
        knownStatuses: ['Phase1', 'Phase2', 'Phase3'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');
      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.map(
            (row) => row.statusName,
          ),
        ).toContain('In Dev');
      });

      await selectTeam(result, 'team-2');
      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(
          result.current.state.data.workflowConfig.rows.map(
            (row) => row.statusName,
          ),
        ).toContain('Phase2');
      });
      if (result.current.state.status !== 'ready') throw new Error('not ready');
      const section = result.current.state.data.workflowConfig;
      const phase2 = section.rows.find((row) => row.statusName === 'Phase2');
      expect(phase2?.tag).toBe('started');
    });

    it('source badge after manual save: auto-detected becomes manual without reload', async () => {
      const gateway = installBasicSettingsStubs();
      gateway.configs.set('team-1', {
        startedStatuses: ['In Progress'],
        completedStatuses: ['Done'],
        source: 'auto-detected',
        knownStatuses: ['In Progress', 'Done'],
      });

      const { result } = renderUseSettings();
      await waitReady(result);
      await selectTeam(result, 'team-1');
      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(result.current.state.data.workflowConfig.isAutoDetected).toBe(
          true,
        );
      });

      await act(async () => {
        result.current.onWorkflowTagChange('In Progress', 'completed');
      });
      await act(async () => {
        await result.current.onWorkflowSave();
      });

      await waitFor(() => {
        if (result.current.state.status !== 'ready') return;
        expect(result.current.state.data.workflowConfig.isManual).toBe(true);
      });
      if (result.current.state.status !== 'ready') throw new Error('not ready');
      expect(result.current.state.data.workflowConfig.isManual).toBe(true);
    });
  });
});
