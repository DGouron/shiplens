import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ApplicationRuleViolationFilter } from '../shared/infrastructure/application-rule-violation.filter.js';
import { BusinessRuleViolationFilter } from '../shared/infrastructure/business-rule-violation.filter.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(
    new BusinessRuleViolationFilter(),
    new ApplicationRuleViolationFilter(),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
