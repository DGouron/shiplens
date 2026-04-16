import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { WorkflowConfigGateway } from '../../entities/workflow-config/workflow-config.gateway.js';
import { WorkflowConfig } from '../../entities/workflow-config/workflow-config.js';

@Injectable()
export class WorkflowConfigInPrismaGateway extends WorkflowConfigGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByTeamId(teamId: string): Promise<WorkflowConfig | null> {
    const record = await this.prisma.teamWorkflowConfig.findUnique({
      where: { teamId },
    });

    if (!record) {
      return null;
    }

    return WorkflowConfig.create({
      startedStatuses: JSON.parse(record.startedStatuses),
      completedStatuses: JSON.parse(record.completedStatuses),
      source: record.source,
    });
  }

  async save(teamId: string, config: WorkflowConfig): Promise<void> {
    await this.prisma.teamWorkflowConfig.upsert({
      where: { teamId },
      create: {
        teamId,
        startedStatuses: JSON.stringify(config.startedStatuses),
        completedStatuses: JSON.stringify(config.completedStatuses),
        source: config.source,
      },
      update: {
        startedStatuses: JSON.stringify(config.startedStatuses),
        completedStatuses: JSON.stringify(config.completedStatuses),
        source: config.source,
      },
    });
  }
}
