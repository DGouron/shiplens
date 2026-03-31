import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/infrastructure/prisma/prisma.module.js';
import { IdentityModule } from '../modules/identity/identity.module.js';
import { SynchronizationModule } from '../modules/synchronization/synchronization.module.js';
import { AnalyticsModule } from '../modules/analytics/analytics.module.js';

@Module({
  imports: [PrismaModule, IdentityModule, SynchronizationModule, AnalyticsModule],
})
export class AppModule {}
