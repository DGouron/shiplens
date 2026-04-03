import { LinearWorkspaceConnectionGateway } from '@modules/identity/entities/linear-workspace-connection/linear-workspace-connection.gateway.js';
import { TokenEncryptionGateway } from '@modules/identity/entities/linear-workspace-connection/token-encryption.gateway.js';
import { Injectable, Logger } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { IssueDataGateway } from '../entities/issue-data/issue-data.gateway.js';
import { type IssueData } from '../entities/issue-data/issue-data.schema.js';
import { LinearIssueDataGateway } from '../entities/issue-data/linear-issue-data.gateway.js';
import { NoTeamSelectedForSyncError } from '../entities/reference-data/reference-data.errors.js';
import { SyncProgressGateway } from '../entities/sync-progress/sync-progress.gateway.js';
import { SyncProgress } from '../entities/sync-progress/sync-progress.js';
import { WorkspaceNotConnectedError } from '../entities/team-selection/team-selection.errors.js';
import { TeamSelectionGateway } from '../entities/team-selection/team-selection.gateway.js';

interface SyncIssueDataParams {
  teamId: string;
}

@Injectable()
export class SyncIssueDataUsecase
  implements Usecase<SyncIssueDataParams, void>
{
  private readonly logger = new Logger(SyncIssueDataUsecase.name);

  constructor(
    private readonly connectionGateway: LinearWorkspaceConnectionGateway,
    private readonly tokenEncryptionGateway: TokenEncryptionGateway,
    private readonly teamSelectionGateway: TeamSelectionGateway,
    private readonly linearIssueDataGateway: LinearIssueDataGateway,
    private readonly issueDataGateway: IssueDataGateway,
    private readonly syncProgressGateway: SyncProgressGateway,
  ) {}

  async execute(params: SyncIssueDataParams): Promise<void> {
    const { teamId } = params;
    const startTime = Date.now();
    this.logger.log(`[${teamId}] Sync started`);

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

    const existingProgress = await this.syncProgressGateway.getByTeamId(teamId);
    const cursor = existingProgress?.canResume ? existingProgress.cursor : null;
    if (cursor) {
      this.logger.log(`[${teamId}] Resuming from cursor`);
    }

    const allIssues = await this.fetchAllIssues(accessToken, teamId, cursor);
    this.logger.log(`[${teamId}] Issues fetched: ${allIssues.length}`);

    await this.issueDataGateway.upsertIssuesForTeam(teamId, allIssues);
    this.logger.log(`[${teamId}] Issues stored`);

    const cycles = await this.linearIssueDataGateway.getCycles(
      accessToken,
      teamId,
    );
    this.logger.log(`[${teamId}] Cycles fetched: ${cycles.length}`);

    await this.issueDataGateway.upsertCyclesForTeam(teamId, cycles);

    const issueExternalIds = allIssues.map((issue) => issue.externalId);
    this.logger.log(
      `[${teamId}] Fetching transitions for ${issueExternalIds.length} issues...`,
    );

    const transitions = await this.linearIssueDataGateway.getIssueHistory(
      accessToken,
      teamId,
      issueExternalIds,
    );
    this.logger.log(`[${teamId}] Transitions fetched: ${transitions.length}`);

    await this.issueDataGateway.upsertTransitionsForTeam(teamId, transitions);

    const completedProgress = SyncProgress.create({
      teamId,
      totalIssues: allIssues.length,
      syncedIssues: allIssues.length,
      status: 'completed',
      cursor: null,
    });
    await this.syncProgressGateway.save(completedProgress);

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    this.logger.log(
      `[${teamId}] Sync completed in ${durationSeconds}s — ${allIssues.length} issues, ${cycles.length} cycles, ${transitions.length} transitions`,
    );
  }

  private async fetchAllIssues(
    accessToken: string,
    teamId: string,
    initialCursor: string | null,
  ): Promise<IssueData[]> {
    const allIssues: IssueData[] = [];
    let cursor = initialCursor;
    let hasNextPage = true;
    let pageNumber = 0;

    while (hasNextPage) {
      const page = await this.linearIssueDataGateway.getIssuesPage(
        accessToken,
        teamId,
        cursor,
      );
      allIssues.push(...page.issues);
      cursor = page.endCursor;
      hasNextPage = page.hasNextPage;
      pageNumber++;
      this.logger.log(
        `[${teamId}] Issues page ${pageNumber}: +${page.issues.length} (total: ${allIssues.length})`,
      );
    }

    return allIssues;
  }
}
