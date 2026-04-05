import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import {
  DEFAULT_TIMEZONE,
  TeamSettingsGateway,
} from '../../entities/team-settings/team-settings.gateway.js';

interface TeamSettingsEntry {
  excludedStatuses: string[];
  timezone?: string;
  reviewStatusName?: string;
}

interface TeamSettingsFile {
  [teamId: string]: TeamSettingsEntry;
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
    settings[teamId] = {
      ...settings[teamId],
      excludedStatuses: statuses,
    };
    await this.writeSettings(settings);
  }

  async getReviewStatusName(teamId: string): Promise<string | null> {
    const settings = await this.readSettings();
    const reviewStatusName = settings[teamId]?.reviewStatusName;
    return typeof reviewStatusName === 'string' && reviewStatusName.length > 0
      ? reviewStatusName
      : null;
  }

  async getTimezone(teamId: string): Promise<string> {
    const settings = await this.readSettings();
    return settings[teamId]?.timezone ?? DEFAULT_TIMEZONE;
  }

  async setTimezone(teamId: string, timezone: string): Promise<void> {
    const settings = await this.readSettings();
    settings[teamId] = {
      ...settings[teamId],
      excludedStatuses: settings[teamId]?.excludedStatuses ?? [],
      timezone,
    };
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
