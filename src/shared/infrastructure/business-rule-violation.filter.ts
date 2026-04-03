import { type ArgumentsHost, Catch, type ExceptionFilter } from '@nestjs/common';
import { type Response } from 'express';
import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

@Catch(BusinessRuleViolation)
export class BusinessRuleViolationFilter implements ExceptionFilter {
  catch(exception: BusinessRuleViolation, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    response.status(422).json({
      statusCode: 422,
      error: exception.name,
      message: exception.message,
    });
  }
}
