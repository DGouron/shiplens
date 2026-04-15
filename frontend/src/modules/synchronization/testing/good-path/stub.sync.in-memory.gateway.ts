import {
  type SaveSyncSelectionInput,
  SyncGateway,
  type SyncTeamIssuesInput,
} from '../../entities/sync/sync.gateway.ts';
import {
  type SyncAvailableTeamResponse,
  type SyncSelectionResponse,
} from '../../entities/sync/sync.response.ts';

interface StubSyncGatewayOptions {
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

export class StubSyncGateway extends SyncGateway {
  readonly availableTeams: SyncAvailableTeamResponse[];
  readonly selection: SyncSelectionResponse;
  saveSelectionCalls: SaveSyncSelectionInput[] = [];
  referenceDataSyncCount = 0;
  teamIssuesSyncedFor: string[] = [];

  constructor(options: StubSyncGatewayOptions = {}) {
    super();
    this.availableTeams = options.availableTeams ?? defaultAvailableTeams;
    this.selection =
      options.selection === undefined ? defaultSelection : options.selection;
  }

  async fetchAvailableTeams(): Promise<SyncAvailableTeamResponse[]> {
    return this.availableTeams;
  }

  async saveSelection(input: SaveSyncSelectionInput): Promise<void> {
    this.saveSelectionCalls.push(input);
  }

  async fetchSelection(): Promise<SyncSelectionResponse> {
    return this.selection;
  }

  async syncReferenceData(): Promise<void> {
    this.referenceDataSyncCount += 1;
  }

  async syncTeamIssues(input: SyncTeamIssuesInput): Promise<void> {
    this.teamIssuesSyncedFor.push(input.teamId);
  }
}
