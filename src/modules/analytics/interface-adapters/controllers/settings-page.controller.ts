import { Controller, Get, Header } from '@nestjs/common';
import { settingsPageHtml } from './settings-page.html.js';

@Controller()
export class SettingsPageController {
  @Get('settings')
  @Header('Content-Type', 'text/html')
  getPage(): string {
    return settingsPageHtml;
  }
}
