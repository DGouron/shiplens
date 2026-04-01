import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../shared/infrastructure/prisma/prisma.module.js';
import { IdentityModule } from '../modules/identity/identity.module.js';
import { SynchronizationModule } from '../modules/synchronization/synchronization.module.js';
import { AnalyticsModule } from '../modules/analytics/analytics.module.js';
import { AuditModule } from '../modules/audit/audit.module.js';
import { NotificationModule } from '../modules/notification/notification.module.js';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), IdentityModule, SynchronizationModule, AnalyticsModule, AuditModule, NotificationModule],
})
export class AppModule {}
