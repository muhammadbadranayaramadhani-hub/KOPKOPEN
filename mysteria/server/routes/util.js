import { AppError } from '../errors.js';

// Bungkus logika route menjadi handler Express dengan format {success,data,error}.
export function handler(run, ai) {
  return async (req, res, next) => {
    try {
      const data = await run(req.body, { ai });
      res.json({ success: true, data, error: null });
    } catch (err) {
      next(err instanceof AppError ? err : err);
    }
  };
}
