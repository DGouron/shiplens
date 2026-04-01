import { Controller, Post, Body } from '@nestjs/common';
import { SyncPackmindRulesUsecase } from '../../usecases/sync-packmind-rules.usecase.js';
import {
  SyncPackmindRulesPresenter,
  type SyncPackmindRulesViewModel,
} from '../presenters/sync-packmind-rules.presenter.js';

interface SyncPackmindRulesBody {
  token: string;
}

@Controller('audit')
export class SyncPackmindRulesController {
  constructor(
    private readonly syncPackmindRulesUsecase: SyncPackmindRulesUsecase,
    private readonly presenter: SyncPackmindRulesPresenter,
  ) {}

  @Post('sync-packmind')
  async syncPackmindRules(@Body() body: SyncPackmindRulesBody): Promise<SyncPackmindRulesViewModel> {
    const result = await this.syncPackmindRulesUsecase.execute({ token: body.token });
    return this.presenter.present(result);
  }
}
