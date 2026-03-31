import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../shared/infrastructure/prisma/prisma.module.js';
import { IdentityModule } from '../modules/identity/identity.module.js';
import { SynchronizationModule } from '../modules/synchronization/synchronization.module.js';
import { AnalyticsModule } from '../modules/analytics/analytics.module.js';

@Module({
  imports: [PrismaModule, ScheduleModule.forRoot(), IdentityModule, SynchronizationModule, AnalyticsModule],
})
export class AppModule {}
