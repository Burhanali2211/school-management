import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';

export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
  timestamp: string;
}

export class AppError extends Error {
  public status: number;
  public isOperational: boolean;

  constructor(message: string, status: number = 500, isOperational: boolean = true) {
    super(message);
    this.status = status;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export function handlePrismaError(error: any): ErrorResponse {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return {
          error: 'UniqueConstraintViolation',
          message: 'A record with this unique field already exists',
          status: 409,
          timestamp: new Date().toISOString(),
        };
      case 'P2025':
        return {
          error: 'RecordNotFound',
          message: 'The requested record was not found',
          status: 404,
          timestamp: new Date().toISOString(),
        };
      case 'P2003':
        return {
          error: 'ForeignKeyConstraintViolation',
          message: 'Referenced record does not exist',
          status: 400,
          timestamp: new Date().toISOString(),
        };
      default:
        return {
          error: 'DatabaseError',
          message: 'A database error occurred',
          status: 500,
          timestamp: new Date().toISOString(),
        };
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return {
      error: 'ValidationError',
      message: 'Invalid data provided',
      status: 400,
      timestamp: new Date().toISOString(),
    };
  }

  return {
    error: 'UnknownError',
    message: 'An unexpected error occurred',
    status: 500,
    timestamp: new Date().toISOString(),
  };
}

export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        status: error.status,
        timestamp: new Date().toISOString(),
      },
      { status: error.status }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError || 
      error instanceof Prisma.PrismaClientValidationError) {
    const prismaError = handlePrismaError(error);
    return NextResponse.json(prismaError, { status: prismaError.status });
  }

  // Default error response
  return NextResponse.json(
    {
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
      status: 500,
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export function validateUserSession(user: any): boolean {
  return !!(user && user.id && user.userId && user.userType);
}

export function sanitizeError(error: any): string {
  if (process.env.NODE_ENV === 'production') {
    return 'An error occurred. Please try again later.';
  }
  return error.message || 'Unknown error';
} 