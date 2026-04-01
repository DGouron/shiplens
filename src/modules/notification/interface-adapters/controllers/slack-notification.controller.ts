import { Controller, Post, Patch, Body } from '@nestjs/common';
import { ConfigureSlackWebhookUsecase } from '../../usecases/configure-slack-webhook.usecase.js';
import { ToggleSlackNotificationUsecase } from '../../usecases/toggle-slack-notification.usecase.js';
import { SendReportToSlackUsecase } from '../../usecases/send-report-to-slack.usecase.js';
import {
  SlackNotificationConfigPresenter,
  type SlackNotificationConfigDto,
} from '../presenters/slack-notification-config.presenter.js';

interface ConfigureWebhookBody {
  teamId: string;
  webhookUrl: string;
}

interface ToggleNotificationBody {
  teamId: string;
  enabled: boolean;
}

interface SendReportBody {
  cycleId: string;
  teamId: string;
}

@Controller('notifications/slack')
export class SlackNotificationController {
  constructor(
    private readonly configureWebhook: ConfigureSlackWebhookUsecase,
    private readonly toggleNotification: ToggleSlackNotificationUsecase,
    private readonly sendReport: SendReportToSlackUsecase,
    private readonly presenter: SlackNotificationConfigPresenter,
  ) {}

  @Post('configure')
  async configure(@Body() body: ConfigureWebhookBody): Promise<SlackNotificationConfigDto> {
    const config = await this.configureWebhook.execute(body);
    return this.presenter.present(config);
  }

  @Patch('toggle')
  async toggle(@Body() body: ToggleNotificationBody): Promise<SlackNotificationConfigDto> {
    const config = await this.toggleNotification.execute(body);
    return this.presenter.present(config);
  }

  @Post('send')
  async send(@Body() body: SendReportBody): Promise<void> {
    await this.sendReport.execute(body);
  }
}
