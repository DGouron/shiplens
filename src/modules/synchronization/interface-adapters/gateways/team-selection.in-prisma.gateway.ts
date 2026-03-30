import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { TeamSelectionGateway } from '../../entities/team-selection/team-selection.gateway.js';
import { TeamSelection } from '../../entities/team-selection/team-selection.js';

@Injectable()
export class TeamSelectionInPrismaGateway extends TeamSelectionGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(selection: TeamSelection): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      await transaction.selectedTeam.deleteMany();
      await transaction.selectedProject.deleteMany();

      for (const team of selection.selectedTeams) {
        await transaction.selectedTeam.create({
          data: {
            teamId: team.teamId,
            teamName: team.teamName,
          },
        });
      }

      for (const project of selection.selectedProjects) {
        await transaction.selectedProject.create({
          data: {
            projectId: project.projectId,
            projectName: project.projectName,
            teamId: project.teamId,
          },
        });
      }
    });
  }

  async get(): Promise<TeamSelection | null> {
    const teams = await this.prisma.selectedTeam.findMany();
    if (teams.length === 0) {
      return null;
    }

    const projects = await this.prisma.selectedProject.findMany();

    return TeamSelection.create({
      selectedTeams: teams.map((team) => ({
        teamId: team.teamId,
        teamName: team.teamName,
      })),
      selectedProjects: projects.map((project) => ({
        projectId: project.projectId,
        projectName: project.projectName,
        teamId: project.teamId,
      })),
    });
  }
}
