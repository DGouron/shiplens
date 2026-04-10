import { GatewayError } from '@shared/foundation/gateway-error';
import { describe, expect, it } from 'vitest';

describe('GatewayError', () => {
  it('should be an instance of Error', () => {
    const error = new GatewayError('gateway failed');
    expect(error).toBeInstanceOf(Error);
  });

  it('should set name to GatewayError', () => {
    const error = new GatewayError('gateway failed');
    expect(error.name).toBe('GatewayError');
  });

  it('should carry the correct message', () => {
    const error = new GatewayError('gateway failed');
    expect(error.message).toBe('gateway failed');
  });

  it('should carry extensions when provided', () => {
    const extensions = { statusCode: 500, endpoint: '/api/data' };
    const error = new GatewayError('gateway failed', extensions);
    expect(error.extensions).toEqual(extensions);
  });

  it('should have undefined extensions when not provided', () => {
    const error = new GatewayError('gateway failed');
    expect(error.extensions).toBeUndefined();
  });
});
