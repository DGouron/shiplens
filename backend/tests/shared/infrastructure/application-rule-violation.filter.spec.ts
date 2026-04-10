import { ApplicationRuleViolation } from '@shared/foundation/application-rule-violation.js';
import { ApplicationRuleViolationFilter } from '@shared/infrastructure/application-rule-violation.filter.js';
import { describe, expect, it } from 'vitest';

class TestApplicationError extends ApplicationRuleViolation {
  constructor() {
    super('Test error message');
  }
}

function createStubHost() {
  const jsonData: Record<string, unknown> = {};
  const response = {
    statusCode: 0,
    status(code: number) {
      response.statusCode = code;
      return response;
    },
    json(data: Record<string, unknown>) {
      Object.assign(jsonData, data);
      return response;
    },
  };

  const host = {
    switchToHttp() {
      return {
        getResponse() {
          return response;
        },
      };
    },
  };

  return { host, response, jsonData };
}

describe('ApplicationRuleViolationFilter', () => {
  it('returns 422 with error name and message', () => {
    const filter = new ApplicationRuleViolationFilter();
    const exception = new TestApplicationError();
    const { host, response, jsonData } = createStubHost();

    filter.catch(exception, host as never);

    expect(response.statusCode).toBe(422);
    expect(jsonData).toEqual({
      statusCode: 422,
      error: 'TestApplicationError',
      message: 'Test error message',
    });
  });
});
