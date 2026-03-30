import { Module } from '@nestjs/common';
import { PrismaModule } from '../shared/infrastructure/prisma/prisma.module.js';
import { IdentityModule } from '../modules/identity/identity.module.js';

@Module({
  imports: [PrismaModule, IdentityModule],
})
export class AppModule {}
