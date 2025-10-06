import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';
import mongoose from 'mongoose';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known AppError
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      ApiResponse.error(err.message, err.code, err.details, err.stack)
    );
  }

  // Handle Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json(
      ApiResponse.error('Validation failed', 'VALIDATION_ERROR', errors)
    );
  }

  // Handle Mongoose duplicate key error
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    return res.status(409).json(
      ApiResponse.error(`Duplicate value for field: ${field}`, 'DUPLICATE_ERROR')
    );
  }

  // Handle Mongoose cast error
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json(ApiResponse.error('Invalid ID format', 'INVALID_ID'));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(ApiResponse.error('Invalid token', 'INVALID_TOKEN'));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(ApiResponse.error('Token expired', 'TOKEN_EXPIRED'));
  }

  // Default to 500 server error
  return res.status(500).json(
    ApiResponse.error('Internal server error', 'INTERNAL_SERVER_ERROR', undefined, err.stack)
  );
};

export const notFoundHandler = (req: Request, res: Response) => {
  return res.status(404).json(
    ApiResponse.error(`Route ${req.originalUrl} not found`, 'NOT_FOUND')
  );
};