import { AppError } from '../errors.js';

export function notFound(req, res, next) {
  next(new AppError('NOT_FOUND', 'Endpoint tidak ditemukan.', 404));
}

// Format galat konsisten: { success:false, data:null, error:{ code, message, retryable } }
export function errorHandler(err, req, res, next) {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Terjadi kesalahan pada server.';
  let retryable = false;
  let extra = {};

  if (err instanceof AppError) {
    status = err.status;
    code = err.code;
    message = err.message;
    retryable = err.retryable;
    extra = err.extra || {};
  } else if (err && err.type === 'entity.parse.failed') {
    status = 400; code = 'INVALID_JSON'; message = 'Isi permintaan bukan JSON yang valid.';
  } else if (err && err.type === 'entity.too.large') {
    status = 413; code = 'PAYLOAD_TOO_LARGE'; message = 'Permintaan terlalu besar.';
  } else {
    // Jangan bocorkan detail internal ke klien; catat di server tanpa data sensitif.
    console.error('[server] galat tak terduga:', err && err.name, err && err.message);
  }

  if (res.headersSent) return next(err);
  const error = { code, message, retryable };
  if (extra.retryAfter) error.retryAfter = extra.retryAfter;
  if (extra.details) error.details = extra.details;
  return res.status(status).json({ success: false, data: null, error });
}
