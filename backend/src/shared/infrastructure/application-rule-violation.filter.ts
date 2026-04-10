import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';
import { ApplicationRuleViolation } from '@shared/foundation/application-rule-violation.js';
import { type Response } from 'express';

@Catch(ApplicationRuleViolation)
export class ApplicationRuleViolationFilter implements ExceptionFilter {
  catch(exception: ApplicationRuleViolation, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(422).json({
      statusCode: 422,
      error: exception.name,
      message: exception.message,
    });
  }
}
