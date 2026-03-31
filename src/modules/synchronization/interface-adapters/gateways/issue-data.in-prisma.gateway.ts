import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { IssueDataGateway } from '../../entities/issue-data/issue-data.gateway.js';
import {
  type IssueData,
  type CycleData,
  type StateTransitionData,
} from '../../entities/issue-data/issue-data.schema.js';

@Injectable()
export class IssueDataInPrismaGateway extends IssueDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async upsertIssuesForTeam(
    teamId: string,
    issues: IssueData[],
  ): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.issue.deleteMany({ where: { teamId } });

      for (const issue of issues) {
        await transaction.issue.create({
          data: {
            externalId: issue.externalId,
            teamId: issue.teamId,
            title: issue.title,
            statusName: issue.statusName,
            points: issue.points,
            labelIds: issue.labelIds,
            assigneeName: issue.assigneeName,
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
          },
        });
      }
    });
  }

  async upsertCyclesForTeam(
    teamId: string,
    cycles: CycleData[],
  ): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.cycle.deleteMany({ where: { teamId } });

      for (const cycle of cycles) {
        await transaction.cycle.create({
          data: {
            externalId: cycle.externalId,
            teamId: cycle.teamId,
            name: cycle.name,
            startsAt: cycle.startsAt,
            endsAt: cycle.endsAt,
            issueExternalIds: cycle.issueExternalIds,
          },
        });
      }
    });
  }

  async upsertTransitionsForTeam(
    teamId: string,
    transitions: StateTransitionData[],
  ): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.stateTransition.deleteMany({ where: { teamId } });

      for (const transition of transitions) {
        await transaction.stateTransition.create({
          data: {
            externalId: transition.externalId,
            issueExternalId: transition.issueExternalId,
            teamId: transition.teamId,
            fromStatusName: transition.fromStatusName,
            toStatusName: transition.toStatusName,
            occurredAt: transition.occurredAt,
          },
        });
      }
    });
  }
}
