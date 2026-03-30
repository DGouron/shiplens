import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/infrastructure/prisma/prisma.module.js';
import { IdentityModule } from '../modules/identity/identity.module.js';
import { SynchronizationModule } from '../modules/synchronization/synchronization.module.js';

@Module({
  imports: [PrismaModule, IdentityModule, SynchronizationModule],
})
export class AppModule {}
