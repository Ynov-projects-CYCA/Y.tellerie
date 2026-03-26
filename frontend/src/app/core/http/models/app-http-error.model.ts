export class AppHttpError extends Error {
  readonly statusCode: number;
  readonly timestamp?: string;
  readonly path?: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options: {
      statusCode: number;
      timestamp?: string;
      path?: string;
      details?: unknown;
    },
  ) {
    super(message);
    this.name = 'AppHttpError';
    this.statusCode = options.statusCode;
    this.timestamp = options.timestamp;
    this.path = options.path;
    this.details = options.details;
  }
}
