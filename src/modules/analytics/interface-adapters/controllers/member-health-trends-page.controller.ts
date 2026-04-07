import { Controller, Get, Header } from '@nestjs/common';
import { GetWorkspaceLanguageUsecase } from '../../usecases/get-workspace-language.usecase.js';
import { buildMemberHealthTrendsHtml } from './member-health-trends.html.js';

@Controller()
export class MemberHealthTrendsPageController {
  constructor(
    private readonly getWorkspaceLanguage: GetWorkspaceLanguageUsecase,
  ) {}

  @Get('member-health-trends')
  @Header('Content-Type', 'text/html')
  async getPage(): Promise<string> {
    const locale = await this.getWorkspaceLanguage.execute();
    return buildMemberHealthTrendsHtml(locale);
  }
}
