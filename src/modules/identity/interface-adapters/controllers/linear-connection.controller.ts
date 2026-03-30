import { Controller, Get, Post, Body } from '@nestjs/common';
import { GetConnectionStatusUsecase } from '../../usecases/get-connection-status.usecase.js';
import { ConnectLinearWorkspaceUsecase } from '../../usecases/connect-linear-workspace.usecase.js';
import { DisconnectLinearWorkspaceUsecase } from '../../usecases/disconnect-linear-workspace.usecase.js';
import { RefreshLinearSessionUsecase } from '../../usecases/refresh-linear-session.usecase.js';
import { ConnectionStatusPresenter, type ConnectionStatusDto } from '../presenters/connection-status.presenter.js';

interface ConnectBody {
  code: string;
  redirectUri: string;
}

@Controller('linear')
export class LinearConnectionController {
  constructor(
    private readonly getConnectionStatus: GetConnectionStatusUsecase,
    private readonly connectLinearWorkspace: ConnectLinearWorkspaceUsecase,
    private readonly disconnectLinearWorkspace: DisconnectLinearWorkspaceUsecase,
    private readonly refreshLinearSession: RefreshLinearSessionUsecase,
    private readonly connectionStatusPresenter: ConnectionStatusPresenter,
  ) {}

  @Get('status')
  async getStatus(): Promise<ConnectionStatusDto> {
    const connection = await this.getConnectionStatus.execute();
    return this.connectionStatusPresenter.present(connection);
  }

  @Post('connect')
  async connect(@Body() body: ConnectBody): Promise<void> {
    await this.connectLinearWorkspace.execute(body);
  }

  @Post('disconnect')
  async disconnect(): Promise<void> {
    await this.disconnectLinearWorkspace.execute();
  }

  @Post('refresh')
  async refresh(): Promise<void> {
    await this.refreshLinearSession.execute();
  }
}
