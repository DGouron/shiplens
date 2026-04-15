import {
  type SyncAvailableTeamResponse,
  type SyncSelectedProjectResponse,
  type SyncSelectedTeamResponse,
  type SyncSelectionResponse,
} from './sync.response.ts';

export interface SaveSyncSelectionInput {
  selectedTeams: SyncSelectedTeamResponse[];
  selectedProjects: SyncSelectedProjectResponse[];
}

export interface SyncTeamIssuesInput {
  teamId: string;
}

export abstract class SyncGateway {
  abstract fetchAvailableTeams(): Promise<SyncAvailableTeamResponse[]>;
  abstract saveSelection(input: SaveSyncSelectionInput): Promise<void>;
  abstract fetchSelection(): Promise<SyncSelectionResponse>;
  abstract syncReferenceData(): Promise<void>;
  abstract syncTeamIssues(input: SyncTeamIssuesInput): Promise<void>;
}
