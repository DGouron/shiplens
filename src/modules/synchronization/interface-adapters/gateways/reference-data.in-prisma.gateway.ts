import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { ReferenceDataGateway } from '../../entities/reference-data/reference-data.gateway.js';
import { type TeamReferenceData } from '../../entities/reference-data/reference-data.schema.js';

@Injectable()
export class ReferenceDataInPrismaGateway extends ReferenceDataGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async upsertForTeam(
    teamId: string,
    data: TeamReferenceData,
  ): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.milestone.deleteMany({
        where: { projectTeamId: teamId },
      });
      await transaction.project.deleteMany({ where: { teamId } });
      await transaction.label.deleteMany({ where: { teamId } });
      await transaction.workflowStatus.deleteMany({ where: { teamId } });
      await transaction.teamMember.deleteMany({ where: { teamId } });

      for (const label of data.labels) {
        await transaction.label.create({
          data: {
            externalId: label.externalId,
            teamId: label.teamId,
            name: label.name,
            color: label.color,
          },
        });
      }

      for (const status of data.workflowStatuses) {
        await transaction.workflowStatus.create({
          data: {
            externalId: status.externalId,
            teamId: status.teamId,
            name: status.name,
            position: status.position,
          },
        });
      }

      for (const member of data.teamMembers) {
        await transaction.teamMember.create({
          data: {
            externalId: member.externalId,
            teamId: member.teamId,
            name: member.name,
            role: member.role,
          },
        });
      }

      for (const project of data.projects) {
        await transaction.project.create({
          data: {
            externalId: project.externalId,
            teamId: project.teamId,
            name: project.name,
          },
        });

        for (const milestone of project.milestones) {
          await transaction.milestone.upsert({
            where: {
              externalId_projectExternalId: {
                externalId: milestone.externalId,
                projectExternalId: milestone.projectExternalId,
              },
            },
            update: {
              name: milestone.name,
              projectTeamId: project.teamId,
            },
            create: {
              externalId: milestone.externalId,
              projectExternalId: milestone.projectExternalId,
              projectTeamId: project.teamId,
              name: milestone.name,
            },
          });
        }
      }
    });
  }
}
