import { TeamSelectionStorageGateway } from '../../entities/team-selection/team-selection.gateway.ts';

export class StubTeamSelectionStorageGateway extends TeamSelectionStorageGateway {
  private readonly entries = new Map<string, string>();

  read(workspaceId: string): string | null {
    return this.entries.get(workspaceId) ?? null;
  }

  write(workspaceId: string, teamId: string): void {
    this.entries.set(workspaceId, teamId);
  }
}
