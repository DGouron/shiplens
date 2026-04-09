import { Body, Controller, Get, Put } from '@nestjs/common';
import { GetWorkspaceLanguageUsecase } from '../../usecases/get-workspace-language.usecase.js';
import { SetWorkspaceLanguageUsecase } from '../../usecases/set-workspace-language.usecase.js';

@Controller('settings')
export class WorkspaceLanguageController {
  constructor(
    private readonly getWorkspaceLanguage: GetWorkspaceLanguageUsecase,
    private readonly setWorkspaceLanguage: SetWorkspaceLanguageUsecase,
  ) {}

  @Get('language')
  async getLanguage(): Promise<{ language: string }> {
    const language = await this.getWorkspaceLanguage.execute();
    return { language };
  }

  @Put('language')
  async setLanguage(@Body() body: { language: string }): Promise<void> {
    await this.setWorkspaceLanguage.execute({ language: body.language });
  }
}
