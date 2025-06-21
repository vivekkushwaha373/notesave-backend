// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export interface AppError extends Error {
    statusCode?: number;
    status?: string;
    isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

// Global error handler
export const globalErrorHandler = (
    error: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let err = { ...error };
    err.message = error.message;

    // Log error
    console.error('Error:', error);

    // Mongoose bad ObjectId
    if (error.name === 'CastError') {
        const message = 'Resource not found';
        err = new CustomError(message, 404);
    }

    // Mongoose duplicate key
    if (error.name === 'MongoServerError' && (error as any).code === 11000) {
        const field = Object.keys((error as any).keyPattern)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
        err = new CustomError(message, 400);
    }

    // Mongoose validation error
    if (error.name === 'ValidationError') {
        const errors = Object.values((error as mongoose.Error.ValidationError).errors).map(
            (val: any) => val.message
        );
        const message = `Invalid input data: ${errors.join(', ')}`;
        err = new CustomError(message, 400);
    }

    // JWT errors
    if (error.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        err = new CustomError(message, 401);
    }

    if (error.name === 'TokenExpiredError') {
        const message = 'Token expired';
        err = new CustomError(message, 401);
    }

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// 404 handler
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
    const error = new CustomError(`Not found - ${req.originalUrl}`, 404);
    next(error);
};