import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { BusinessRuleViolationFilter } from '../shared/infrastructure/business-rule-violation.filter.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new BusinessRuleViolationFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
