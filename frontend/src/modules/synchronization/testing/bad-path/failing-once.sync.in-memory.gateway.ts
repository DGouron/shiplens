import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import {
  type SaveSyncSelectionInput,
  SyncGateway,
  type SyncTeamIssuesInput,
} from '../../entities/sync/sync.gateway.ts';
import {
  type SyncAvailableTeamResponse,
  type SyncSelectionResponse,
} from '../../entities/sync/sync.response.ts';

type SyncMethodName =
  | 'fetchAvailableTeams'
  | 'saveSelection'
  | 'fetchSelection'
  | 'syncReferenceData'
  | 'syncTeamIssues';

interface FailingOnceSyncGatewayOptions {
  failingMethod: SyncMethodName;
  failureCount: number;
  availableTeams?: SyncAvailableTeamResponse[];
  selection?: SyncSelectionResponse;
}

const defaultAvailableTeams: SyncAvailableTeamResponse[] = [
  {
    teamId: 'team-1',
    teamName: 'Team One',
    projects: [{ projectId: 'project-1', projectName: 'Project One' }],
  },
];

const defaultSelection: SyncSelectionResponse = {
  selectedTeams: [{ teamId: 'team-1', teamName: 'Team One' }],
  selectedProjects: [
    { projectId: 'project-1', projectName: 'Project One', teamId: 'team-1' },
  ],
};

export class FailingOnceSyncGateway extends SyncGateway {
  private readonly failingMethod: SyncMethodName;
  private remainingFailures: number;
  private readonly availableTeams: SyncAvailableTeamResponse[];
  private readonly selection: SyncSelectionResponse;
  referenceDataSyncCount = 0;
  teamIssuesSyncedFor: string[] = [];
  saveSelectionCalls: SaveSyncSelectionInput[] = [];

  constructor(options: FailingOnceSyncGatewayOptions) {
    super();
    this.failingMethod = options.failingMethod;
    this.remainingFailures = options.failureCount;
    this.availableTeams = options.availableTeams ?? defaultAvailableTeams;
    this.selection =
      options.selection === undefined ? defaultSelection : options.selection;
  }

  private shouldFailNow(method: SyncMethodName): boolean {
    if (method !== this.failingMethod) return false;
    if (this.remainingFailures <= 0) return false;
    this.remainingFailures -= 1;
    return true;
  }

  async fetchAvailableTeams(): Promise<SyncAvailableTeamResponse[]> {
    if (this.shouldFailNow('fetchAvailableTeams')) {
      throw new GatewayError('Sync failed');
    }
    return this.availableTeams;
  }

  async saveSelection(input: SaveSyncSelectionInput): Promise<void> {
    if (this.shouldFailNow('saveSelection')) {
      throw new GatewayError('Sync failed');
    }
    this.saveSelectionCalls.push(input);
  }

  async fetchSelection(): Promise<SyncSelectionResponse> {
    if (this.shouldFailNow('fetchSelection')) {
      throw new GatewayError('Sync failed');
    }
    return this.selection;
  }

  async syncReferenceData(): Promise<void> {
    if (this.shouldFailNow('syncReferenceData')) {
      throw new GatewayError('Sync failed');
    }
    this.referenceDataSyncCount += 1;
  }

  async syncTeamIssues(input: SyncTeamIssuesInput): Promise<void> {
    if (this.shouldFailNow('syncTeamIssues')) {
      throw new GatewayError('Sync failed');
    }
    this.teamIssuesSyncedFor.push(input.teamId);
  }
}
