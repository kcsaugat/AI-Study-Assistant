import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('[Error]', err.stack || err.message);
  const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
  
  // Expose client-side errors (400-499) in production, but mask internal server errors (>= 500)
  const isClientError = statusCode >= 400 && statusCode < 500;
  const message = (process.env.NODE_ENV === 'production' && !isClientError)
    ? 'Internal server error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message,
  });
}
