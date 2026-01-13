/**
 * Centralized Error Handling Module
 * Provides standardized error types and response utilities for consistent API error handling
 */

/**
 * Standard API error class with status code and optional error code
 */
export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly code?: string;
    public readonly details?: unknown;

    constructor(statusCode: number, message: string, code?: string, details?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;

        // Maintains proper stack trace for where error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}

/**
 * Standard error response structure for API endpoints
 */
export interface ErrorResponse {
    success: false;
    error: {
        message: string;
        code?: string;
        details?: unknown;
    };
}

/**
 * Standard success response structure for API endpoints
 */
export interface SuccessResponse<T = unknown> {
    success: true;
    data: T;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

/**
 * Creates a standardized error response object
 */
export function createErrorResponse(
    message: string,
    code?: string,
    details?: unknown
): ErrorResponse {
    return {
        success: false,
        error: {
            message,
            ...(code && { code }),
            ...(details !== undefined && { details }),
        },
    };
}

/**
 * Creates a standardized success response object
 */
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
    return {
        success: true,
        data,
    };
}

/**
 * Type guard to check if a response is an error response
 */
export function isErrorResponse(response: ApiResponse): response is ErrorResponse {
    return response.success === false;
}

/**
 * Type guard to check if a response is a success response
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): response is SuccessResponse<T> {
    return response.success === true;
}

/**
 * Common error factory functions for creating standardized errors
 */
export const errors = {
    /**
     * 400 Bad Request - Invalid input or malformed request
     */
    badRequest: (message: string, details?: unknown): ApiError =>
        new ApiError(400, message, 'BAD_REQUEST', details),

    /**
     * 401 Unauthorized - Authentication required or failed
     */
    unauthorized: (message = 'Unauthorized'): ApiError =>
        new ApiError(401, message, 'UNAUTHORIZED'),

    /**
     * 403 Forbidden - Authenticated but not authorized for this action
     */
    forbidden: (message = 'Forbidden'): ApiError =>
        new ApiError(403, message, 'FORBIDDEN'),

    /**
     * 404 Not Found - Resource does not exist
     */
    notFound: (message = 'Not found'): ApiError =>
        new ApiError(404, message, 'NOT_FOUND'),

    /**
     * 405 Method Not Allowed - HTTP method not supported
     */
    methodNotAllowed: (allowed: string): ApiError =>
        new ApiError(405, 'Method not allowed', 'METHOD_NOT_ALLOWED', { allowed }),

    /**
     * 409 Conflict - Resource conflict (e.g., duplicate entry)
     */
    conflict: (message: string): ApiError =>
        new ApiError(409, message, 'CONFLICT'),

    /**
     * 422 Unprocessable Entity - Validation failed
     */
    validationError: (message: string, details?: unknown): ApiError =>
        new ApiError(422, message, 'VALIDATION_ERROR', details),

    /**
     * 429 Too Many Requests - Rate limit exceeded
     */
    rateLimitExceeded: (message = 'Too many requests'): ApiError =>
        new ApiError(429, message, 'RATE_LIMIT_EXCEEDED'),

    /**
     * 500 Internal Server Error - Unexpected server error
     */
    serverError: (message = 'Internal server error'): ApiError =>
        new ApiError(500, message, 'INTERNAL_ERROR'),

    /**
     * 502 Bad Gateway - Backend service unavailable
     */
    badGateway: (message = 'Failed to reach backend server'): ApiError =>
        new ApiError(502, message, 'BAD_GATEWAY'),

    /**
     * 503 Service Unavailable - Service temporarily unavailable
     */
    serviceUnavailable: (message = 'Service temporarily unavailable'): ApiError =>
        new ApiError(503, message, 'SERVICE_UNAVAILABLE'),
};

/**
 * Extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError) {
        return error.message;
    }
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    return 'An unexpected error occurred';
}

/**
 * Safely converts an unknown error to an ApiError
 */
export function toApiError(error: unknown, defaultMessage = 'An unexpected error occurred'): ApiError {
    if (error instanceof ApiError) {
        return error;
    }
    if (error instanceof Error) {
        return new ApiError(500, error.message, 'INTERNAL_ERROR');
    }
    if (typeof error === 'string') {
        return new ApiError(500, error, 'INTERNAL_ERROR');
    }
    return new ApiError(500, defaultMessage, 'INTERNAL_ERROR');
}
