import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { SprintReportGateway } from '../../entities/sprint-report/sprint-report.gateway.js';
import { SprintReport } from '../../entities/sprint-report/sprint-report.js';
import { type AuditSection, auditSectionSchema } from '../../entities/sprint-report/sprint-report.schema.js';

@Injectable()
export class SprintReportInPrismaGateway extends SprintReportGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async save(report: SprintReport): Promise<void> {
    await this.prisma.sprintReport.create({
      data: {
        id: report.id,
        cycleId: report.cycleId,
        teamId: report.teamId,
        cycleName: report.cycleName,
        language: report.language,
        generatedAt: report.generatedAt,
        executiveSummary: report.executiveSummary,
        trends: report.trends,
        highlights: report.highlights,
        risks: report.risks,
        recommendations: report.recommendations,
        auditSection: report.auditSection ? JSON.stringify(report.auditSection) : null,
      },
    });
  }

  async findByTeamId(teamId: string): Promise<SprintReport[]> {
    const records = await this.prisma.sprintReport.findMany({
      where: { teamId },
      orderBy: { generatedAt: 'desc' },
    });

    return records.map((record) =>
      SprintReport.create({
        id: record.id,
        cycleId: record.cycleId,
        teamId: record.teamId,
        cycleName: record.cycleName,
        language: record.language,
        generatedAt: record.generatedAt,
        sections: {
          executiveSummary: record.executiveSummary,
          trends: record.trends,
          highlights: record.highlights,
          risks: record.risks,
          recommendations: record.recommendations,
        },
        auditSection: this.parseAuditSection(record.auditSection),
      }),
    );
  }

  async findById(reportId: string): Promise<SprintReport | null> {
    const record = await this.prisma.sprintReport.findUnique({
      where: { id: reportId },
    });

    if (!record) {
      return null;
    }

    return SprintReport.create({
      id: record.id,
      cycleId: record.cycleId,
      teamId: record.teamId,
      cycleName: record.cycleName,
      language: record.language,
      generatedAt: record.generatedAt,
      sections: {
        executiveSummary: record.executiveSummary,
        trends: record.trends,
        highlights: record.highlights,
        risks: record.risks,
        recommendations: record.recommendations,
      },
      auditSection: this.parseAuditSection(record.auditSection),
    });
  }

  private parseAuditSection(raw: string | null): AuditSection | null {
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return auditSectionSchema.parse(parsed);
  }
}
