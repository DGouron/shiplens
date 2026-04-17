export abstract class TeamSelectionStorageGateway {
  abstract read(workspaceId: string): string | null;
  abstract write(workspaceId: string, teamId: string): void;
}
