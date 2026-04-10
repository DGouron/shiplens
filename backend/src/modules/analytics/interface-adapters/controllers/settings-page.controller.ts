import { Controller, Get, Header } from '@nestjs/common';
import { GetWorkspaceLanguageUsecase } from '../../usecases/get-workspace-language.usecase.js';
import { buildSettingsPageHtml } from './settings-page.html.js';

@Controller()
export class SettingsPageController {
  constructor(
    private readonly getWorkspaceLanguage: GetWorkspaceLanguageUsecase,
  ) {}

  @Get('settings')
  @Header('Content-Type', 'text/html')
  async getPage(): Promise<string> {
    const locale = await this.getWorkspaceLanguage.execute();
    return buildSettingsPageHtml(locale);
  }
}
