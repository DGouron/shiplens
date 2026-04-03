import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { TeamSettingsGateway } from '../../entities/team-settings/team-settings.gateway.js';

interface TeamSettingsFile {
  [teamId: string]: { excludedStatuses: string[] };
}

@Injectable()
export class TeamSettingsInFileGateway extends TeamSettingsGateway {
  private readonly filePath = join(process.cwd(), 'data', 'team-settings.json');

  async getExcludedStatuses(teamId: string): Promise<string[]> {
    const settings = await this.readSettings();
    return settings[teamId]?.excludedStatuses ?? [];
  }

  async setExcludedStatuses(teamId: string, statuses: string[]): Promise<void> {
    const settings = await this.readSettings();
    settings[teamId] = { excludedStatuses: statuses };
    await this.writeSettings(settings);
  }

  private async readSettings(): Promise<TeamSettingsFile> {
    try {
      const content = await readFile(this.filePath, 'utf-8');
      return JSON.parse(content) as TeamSettingsFile;
    } catch {
      return {};
    }
  }

  private async writeSettings(settings: TeamSettingsFile): Promise<void> {
    await mkdir(join(process.cwd(), 'data'), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(settings, null, 2), 'utf-8');
  }
}
