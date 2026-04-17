import { join } from 'node:path';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AnalyticsModule } from '../modules/analytics/analytics.module.js';
import { AuditModule } from '../modules/audit/audit.module.js';
import { IdentityModule } from '../modules/identity/identity.module.js';
import { NotificationModule } from '../modules/notification/notification.module.js';
import { SynchronizationModule } from '../modules/synchronization/synchronization.module.js';
import { PrismaModule } from '../shared/infrastructure/prisma/prisma.module.js';

const isProduction = process.env.NODE_ENV === 'production';

const productionStaticModules = isProduction
  ? [
      ServeStaticModule.forRoot({
        rootPath: join(process.cwd(), '..', 'frontend', 'dist'),
        exclude: [
          '/dashboard/data',
          '/analytics/*splat',
          '/api/*splat',
          '/settings/*splat',
          '/sync/*splat',
          '/linear/*splat',
          '/webhooks/*splat',
          '/notifications/*splat',
        ],
      }),
    ]
  : [];

@Module({
  imports: [
    PrismaModule,
    ScheduleModule.forRoot(),
    ...productionStaticModules,
    IdentityModule,
    SynchronizationModule,
    AnalyticsModule,
    AuditModule,
    NotificationModule,
  ],
})
export class AppModule {}
