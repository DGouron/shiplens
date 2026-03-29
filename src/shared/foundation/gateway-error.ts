export class GatewayError extends Error {
  readonly extensions?: Record<string, unknown>;

  constructor(message: string, extensions?: Record<string, unknown>) {
    super(message);
    this.name = 'GatewayError';
    this.extensions = extensions;
  }
}
