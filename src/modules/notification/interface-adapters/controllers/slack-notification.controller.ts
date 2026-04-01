import { Controller, Post, Body } from '@nestjs/common';
import { ConfigureSlackWebhookUsecase } from '../../usecases/configure-slack-webhook.usecase.js';
import { SendReportOnSlackUsecase } from '../../usecases/send-report-on-slack.usecase.js';
import { ConfigureTeamAlertChannelUsecase } from '../../usecases/configure-team-alert-channel.usecase.js';
import { AlertBlockedIssuesOnSlackUsecase } from '../../usecases/alert-blocked-issues-on-slack.usecase.js';

interface ConfigureSlackWebhookBody {
  teamId: string;
  webhookUrl: string;
}

interface SendReportOnSlackBody {
  teamId: string;
  reportId: string;
  reportLink: string;
}

interface ConfigureAlertChannelBody {
  teamId: string;
  webhookUrl: string;
}

@Controller('notifications/slack')
export class SlackNotificationController {
  constructor(
    private readonly configureSlackWebhook: ConfigureSlackWebhookUsecase,
    private readonly sendReportOnSlack: SendReportOnSlackUsecase,
    private readonly configureTeamAlertChannel: ConfigureTeamAlertChannelUsecase,
    private readonly alertBlockedIssues: AlertBlockedIssuesOnSlackUsecase,
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

  @Post('alerts/configure')
  async configureAlerts(
    @Body() body: ConfigureAlertChannelBody,
  ): Promise<void> {
    await this.configureTeamAlertChannel.execute({
      teamId: body.teamId,
      webhookUrl: body.webhookUrl,
    });
  }

  @Post('alerts/send')
  async sendAlerts(): Promise<void> {
    await this.alertBlockedIssues.execute();
  }
}
