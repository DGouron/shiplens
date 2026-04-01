import { Controller, Post, Body } from '@nestjs/common';
import { ConfigureSlackWebhookUsecase } from '../../usecases/configure-slack-webhook.usecase.js';
import { SendReportOnSlackUsecase } from '../../usecases/send-report-on-slack.usecase.js';

interface ConfigureSlackWebhookBody {
  teamId: string;
  webhookUrl: string;
}

interface SendReportOnSlackBody {
  teamId: string;
  reportId: string;
  reportLink: string;
}

@Controller('notifications/slack')
export class SlackNotificationController {
  constructor(
    private readonly configureSlackWebhook: ConfigureSlackWebhookUsecase,
    private readonly sendReportOnSlack: SendReportOnSlackUsecase,
  ) {}

  @Post('configure')
  async configure(@Body() body: ConfigureSlackWebhookBody): Promise<void> {
    await this.configureSlackWebhook.execute({
      teamId: body.teamId,
      webhookUrl: body.webhookUrl,
    });
  }

  @Post('send')
  async send(@Body() body: SendReportOnSlackBody): Promise<void> {
    await this.sendReportOnSlack.execute({
      teamId: body.teamId,
      reportId: body.reportId,
      reportLink: body.reportLink,
    });
  }
}
