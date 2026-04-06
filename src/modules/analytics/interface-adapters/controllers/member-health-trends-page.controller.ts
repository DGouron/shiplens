import { Controller, Get, Header } from '@nestjs/common';
import { memberHealthTrendsHtml } from './member-health-trends.html.js';

@Controller()
export class MemberHealthTrendsPageController {
  @Get('member-health-trends')
  @Header('Content-Type', 'text/html')
  getPage(): string {
    return memberHealthTrendsHtml;
  }
}
