import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { Injectable } from '@nestjs/common';
import {
  type Locale,
  workspaceLanguageSchema,
} from '../../entities/workspace-settings/workspace-language.schema.js';
import { WorkspaceSettingsGateway } from '../../entities/workspace-settings/workspace-settings.gateway.js';

interface WorkspaceSettingsFile {
  language?: string;
}

const DEFAULT_LOCALE: Locale = 'en';

@Injectable()
export class WorkspaceSettingsInFileGateway extends WorkspaceSettingsGateway {
  protected readonly filePath = join(
    process.cwd(),
    'data',
    'workspace-settings.json',
  );

  async getLanguage(): Promise<Locale> {
    const settings = await this.readSettings();
    const result = workspaceLanguageSchema.safeParse(settings.language);
    if (result.success) {
      return result.data;
    }
    return DEFAULT_LOCALE;
  }

  async setLanguage(locale: Locale): Promise<void> {
    const settings = await this.readSettings();
    settings.language = locale;
    await this.writeSettings(settings);
  }

  private async readSettings(): Promise<WorkspaceSettingsFile> {
    try {
      const content = await readFile(this.filePath, 'utf-8');
      return JSON.parse(content) as WorkspaceSettingsFile;
    } catch {
      return {};
    }
  }

  private async writeSettings(settings: WorkspaceSettingsFile): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(settings, null, 2), 'utf-8');
  }
}
