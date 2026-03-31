import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { LinearWorkspaceConnectionGateway } from '@modules/identity/entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { TokenEncryptionGateway } from '@modules/identity/entities/linear-workspace-connection/token-encryption.gateway.js';
import { TeamSelectionGateway } from '../entities/team-selection/team-selection.gateway.js';
import { LinearIssueDataGateway } from '../entities/issue-data/linear-issue-data.gateway.js';
import { IssueDataGateway } from '../entities/issue-data/issue-data.gateway.js';
import { SyncProgressGateway } from '../entities/sync-progress/sync-progress.gateway.js';
import { SyncProgress } from '../entities/sync-progress/sync-progress.js';
import { type IssueData } from '../entities/issue-data/issue-data.schema.js';
import { WorkspaceNotConnectedError } from '../entities/team-selection/team-selection.errors.js';
import { NoTeamSelectedForSyncError } from '../entities/reference-data/reference-data.errors.js';

interface SyncIssueDataParams {
  teamId: string;
}

@Injectable()
export class SyncIssueDataUsecase implements Usecase<SyncIssueDataParams, void> {
  constructor(
    private readonly connectionGateway: LinearWorkspaceConnectionGateway,
    private readonly tokenEncryptionGateway: TokenEncryptionGateway,
    private readonly teamSelectionGateway: TeamSelectionGateway,
    private readonly linearIssueDataGateway: LinearIssueDataGateway,
    private readonly issueDataGateway: IssueDataGateway,
    private readonly syncProgressGateway: SyncProgressGateway,
  ) {}

  async execute(params: SyncIssueDataParams): Promise<void> {
    const connection = await this.connectionGateway.get();
    if (!connection) {
      throw new WorkspaceNotConnectedError();
    }

    const selection = await this.teamSelectionGateway.get();
    if (!selection) {
      throw new NoTeamSelectedForSyncError();
    }

    const accessToken = await this.tokenEncryptionGateway.decrypt(
      connection.encryptedAccessToken,
    );

    const { teamId } = params;

    const existingProgress = await this.syncProgressGateway.getByTeamId(teamId);
    const cursor = existingProgress?.canResume ? existingProgress.cursor : null;

    const allIssues = await this.fetchAllIssues(accessToken, teamId, cursor);

    await this.issueDataGateway.upsertIssuesForTeam(teamId, allIssues);

    const cycles = await this.linearIssueDataGateway.getCycles(accessToken, teamId);
    await this.issueDataGateway.upsertCyclesForTeam(teamId, cycles);

    const issueExternalIds = allIssues.map((issue) => issue.externalId);
    const transitions = await this.linearIssueDataGateway.getIssueHistory(
      accessToken,
      teamId,
      issueExternalIds,
    );
    await this.issueDataGateway.upsertTransitionsForTeam(teamId, transitions);

    const completedProgress = SyncProgress.create({
      teamId,
      totalIssues: allIssues.length,
      syncedIssues: allIssues.length,
      status: 'completed',
      cursor: null,
    });
    await this.syncProgressGateway.save(completedProgress);
  }

  private async fetchAllIssues(
    accessToken: string,
    teamId: string,
    initialCursor: string | null,
  ): Promise<IssueData[]> {
    const allIssues: IssueData[] = [];
    let cursor = initialCursor;
    let hasNextPage = true;

    while (hasNextPage) {
      const page = await this.linearIssueDataGateway.getIssuesPage(
        accessToken,
        teamId,
        cursor,
      );
      allIssues.push(...page.issues);
      cursor = page.endCursor;
      hasNextPage = page.hasNextPage;
    }

    return allIssues;
  }
}
