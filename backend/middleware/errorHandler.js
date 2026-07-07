import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';
  const message = err.message || 'Internal Server Error';

  // Log detailed error for server monitoring
  console.error('💥 Error caught in middleware:', {
    message,
    statusCode,
    stack: env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const response = {
    status,
    message,
  };

  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};
