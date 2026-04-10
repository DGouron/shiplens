import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { IssueDataGateway } from '../../entities/issue-data/issue-data.gateway.js';
import {
  type CommentData,
  type CycleData,
  type IssueData,
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
            statusType: issue.statusType,
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
            number: cycle.number,
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
            fromStatusType: transition.fromStatusType,
            toStatusName: transition.toStatusName,
            toStatusType: transition.toStatusType,
            occurredAt: transition.occurredAt,
          },
        });
      }
    });
  }

  async upsertIssue(issue: IssueData): Promise<void> {
    await this.prisma.issue.upsert({
      where: {
        externalId_teamId: {
          externalId: issue.externalId,
          teamId: issue.teamId,
        },
      },
      create: {
        externalId: issue.externalId,
        teamId: issue.teamId,
        title: issue.title,
        statusName: issue.statusName,
        statusType: issue.statusType,
        points: issue.points,
        labelIds: issue.labelIds,
        assigneeName: issue.assigneeName,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      },
      update: {
        title: issue.title,
        statusName: issue.statusName,
        statusType: issue.statusType,
        points: issue.points,
        labelIds: issue.labelIds,
        assigneeName: issue.assigneeName,
        updatedAt: issue.updatedAt,
        deletedAt: null,
      },
    });
  }

  async softDeleteIssue(externalId: string, teamId: string): Promise<void> {
    await this.prisma.issue.updateMany({
      where: { externalId, teamId },
      data: { deletedAt: new Date().toISOString() },
    });
  }

  async upsertCycle(cycle: CycleData): Promise<void> {
    await this.prisma.cycle.upsert({
      where: {
        externalId_teamId: {
          externalId: cycle.externalId,
          teamId: cycle.teamId,
        },
      },
      create: {
        externalId: cycle.externalId,
        teamId: cycle.teamId,
        name: cycle.name,
        number: cycle.number,
        startsAt: cycle.startsAt,
        endsAt: cycle.endsAt,
        issueExternalIds: cycle.issueExternalIds,
      },
      update: {
        name: cycle.name,
        number: cycle.number,
        startsAt: cycle.startsAt,
        endsAt: cycle.endsAt,
        issueExternalIds: cycle.issueExternalIds,
      },
    });
  }

  async createComment(comment: CommentData): Promise<void> {
    await this.prisma.comment.upsert({
      where: {
        externalId_teamId: {
          externalId: comment.externalId,
          teamId: comment.teamId,
        },
      },
      create: {
        externalId: comment.externalId,
        issueExternalId: comment.issueExternalId,
        teamId: comment.teamId,
        body: comment.body,
        authorName: comment.authorName,
        createdAt: comment.createdAt,
      },
      update: {
        body: comment.body,
      },
    });
  }

  async upsertTransition(transition: StateTransitionData): Promise<void> {
    await this.prisma.stateTransition.upsert({
      where: {
        externalId_teamId: {
          externalId: transition.externalId,
          teamId: transition.teamId,
        },
      },
      create: {
        externalId: transition.externalId,
        issueExternalId: transition.issueExternalId,
        teamId: transition.teamId,
        fromStatusName: transition.fromStatusName,
        fromStatusType: transition.fromStatusType,
        toStatusName: transition.toStatusName,
        toStatusType: transition.toStatusType,
        occurredAt: transition.occurredAt,
      },
      update: {
        fromStatusName: transition.fromStatusName,
        fromStatusType: transition.fromStatusType,
        toStatusName: transition.toStatusName,
        toStatusType: transition.toStatusType,
        occurredAt: transition.occurredAt,
      },
    });
  }
}
