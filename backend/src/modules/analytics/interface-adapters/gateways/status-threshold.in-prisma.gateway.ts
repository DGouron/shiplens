import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { StatusThresholdGateway } from '../../entities/status-threshold/status-threshold.gateway.js';
import { StatusThreshold } from '../../entities/status-threshold/status-threshold.js';

@Injectable()
export class StatusThresholdInPrismaGateway extends StatusThresholdGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByStatusName(statusName: string): Promise<StatusThreshold | null> {
    const record = await this.prisma.statusThreshold.findUnique({
      where: { statusName },
    });

    if (!record) return null;

    return StatusThreshold.create({
      id: record.id,
      statusName: record.statusName,
      thresholdHours: record.thresholdHours,
    });
  }

  async findAll(): Promise<StatusThreshold[]> {
    const records = await this.prisma.statusThreshold.findMany();

    return records.map((record) =>
      StatusThreshold.create({
        id: record.id,
        statusName: record.statusName,
        thresholdHours: record.thresholdHours,
      }),
    );
  }

  async save(threshold: StatusThreshold): Promise<void> {
    await this.prisma.statusThreshold.upsert({
      where: { statusName: threshold.statusName },
      create: {
        id: threshold.id,
        statusName: threshold.statusName,
        thresholdHours: threshold.thresholdHours,
      },
      update: {
        thresholdHours: threshold.thresholdHours,
      },
    });
  }
}
