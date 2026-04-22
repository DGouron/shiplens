import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/infrastructure/prisma/prisma.service.js';
import { CycleThemeSet } from '../../entities/cycle-theme-set/cycle-theme-set.js';
import { CycleThemeSetCacheGateway } from '../../entities/cycle-theme-set/cycle-theme-set-cache.gateway.js';

@Injectable()
export class CycleThemeSetCacheInPrismaGateway extends CycleThemeSetCacheGateway {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async get(cycleId: string): Promise<CycleThemeSet | null> {
    const record = await this.prisma.cycleThemeSet.findUnique({
      where: { cycleId },
    });

    if (!record) {
      return null;
    }

    const parsedThemes: unknown = JSON.parse(record.themesJson);

    return CycleThemeSet.create({
      cycleId: record.cycleId,
      teamId: record.teamId,
      language: record.language,
      themes: parsedThemes,
      generatedAt: record.generatedAt,
    });
  }

  async save(themeSet: CycleThemeSet): Promise<void> {
    const data = {
      teamId: themeSet.teamId,
      language: themeSet.language,
      themesJson: JSON.stringify(themeSet.themes),
      generatedAt: themeSet.generatedAt,
    };

    await this.prisma.cycleThemeSet.upsert({
      where: { cycleId: themeSet.cycleId },
      create: { cycleId: themeSet.cycleId, ...data },
      update: data,
    });
  }

  async delete(cycleId: string): Promise<void> {
    await this.prisma.cycleThemeSet.deleteMany({ where: { cycleId } });
  }
}
