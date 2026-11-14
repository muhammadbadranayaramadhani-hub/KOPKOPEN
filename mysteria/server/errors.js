// Galat terstruktur untuk seluruh backend. errorHandler mengubahnya menjadi respons JSON konsisten.

const RETRYABLE = new Set([
  'AI_TIMEOUT', 'AI_UNAVAILABLE', 'AI_RATE_LIMITED', 'AI_EMPTY_RESPONSE', 'AI_BAD_OUTPUT', 'RATE_LIMITED',
]);

export class AppError extends Error {
  constructor(code, message, status = 500, extra = {}) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.extra = extra;
    this.retryable = RETRYABLE.has(code);
  }
}

export const invalid = (message, details) => new AppError('INVALID_REQUEST', message, 400, details ? { details } : {});
