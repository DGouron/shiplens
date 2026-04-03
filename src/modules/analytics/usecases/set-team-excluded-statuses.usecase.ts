import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { BlockedIssueAlertGateway } from '../entities/blocked-issue-alert/blocked-issue-alert.gateway.js';
import { TeamSettingsGateway } from '../entities/team-settings/team-settings.gateway.js';

interface SetExcludedStatusesParams {
  teamId: string;
  statuses: string[];
}

@Injectable()
export class SetTeamExcludedStatusesUsecase
  implements Usecase<SetExcludedStatusesParams, void>
{
  constructor(
    private readonly teamSettingsGateway: TeamSettingsGateway,
    private readonly blockedIssueAlertGateway: BlockedIssueAlertGateway,
  ) {}

  async execute(params: SetExcludedStatusesParams): Promise<void> {
    await this.teamSettingsGateway.setExcludedStatuses(
      params.teamId,
      params.statuses,
    );

    if (params.statuses.length === 0) return;

    const activeAlerts = await this.blockedIssueAlertGateway.findAllActive();
    const excludedSet = new Set(params.statuses);
    const now = new Date().toISOString();

    const toResolve = activeAlerts
      .filter(
        (alert) =>
          alert.teamId === params.teamId && excludedSet.has(alert.statusName),
      )
      .map((alert) => alert.resolve(now));

    if (toResolve.length > 0) {
      await this.blockedIssueAlertGateway.saveMany(toResolve);
    }
  }
}
