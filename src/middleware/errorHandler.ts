import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { config } from '../config/env.js'
import logger from '../lib/logger.js'

// ─── Error Type Constants ─────────────────────────────────────────────────────
export const ErrorType = {
    DATABASE_ERROR: 'DATABASE_ERROR',
    PRISMA_ERROR: 'PRISMA_ERROR',
    CORS_ERROR: 'CORS_ERROR',
    ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTH_ERROR: 'AUTH_ERROR',
    SERVER_CONFIG_ERROR: 'SERVER_CONFIG_ERROR',
    UNKNOWN_SERVER_ERROR: 'UNKNOWN_SERVER_ERROR',
} as const

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType]

// ─── Classified Error Response Shape ─────────────────────────────────────────
interface ClassifiedError {
    success: false
    errorType: ErrorType
    message: string
    possibleCauses: string[]
    solutionHint: string
    stack?: string          // only in development
}

// ─── Root-Cause Classifier ────────────────────────────────────────────────────
function classifyError(err: any): Omit<ClassifiedError, 'success' | 'stack'> & { statusCode: number } {
    const msg: string = err?.message ?? ''

    // ── Prisma-specific errors ────────────────────────────────────────────────
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        const code = err.code
        if (code === 'P2002') {
            return {
                statusCode: 409,
                errorType: ErrorType.PRISMA_ERROR,
                message: 'A record with this value already exists (unique constraint violation)',
                possibleCauses: ['Duplicate slug, email, or unique field', 'Concurrent write race condition'],
                solutionHint: 'Check the field mentioned in the error and ensure uniqueness before inserting',
            }
        }
        if (code === 'P2025') {
            return {
                statusCode: 404,
                errorType: ErrorType.PRISMA_ERROR,
                message: 'Record not found',
                possibleCauses: ['The requested resource does not exist', 'Incorrect ID or slug'],
                solutionHint: 'Verify the ID or slug before making the request',
            }
        }
        return {
            statusCode: 500,
            errorType: ErrorType.PRISMA_ERROR,
            message: `Database operation failed (Prisma code: ${code})`,
            possibleCauses: ['Database schema mismatch', 'Constraint violation', 'Missing relation'],
            solutionHint: `Look up Prisma error code ${code} at https://www.prisma.io/docs/reference/api-reference/error-reference`,
        }
    }

    if (
        err instanceof Prisma.PrismaClientInitializationError ||
        err instanceof Prisma.PrismaClientRustPanicError ||
        msg.includes("Can't reach database server") ||
        msg.includes('Connection refused') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('database') && msg.includes('connect')
    ) {
        return {
            statusCode: 503,
            errorType: ErrorType.DATABASE_ERROR,
            message: 'Database is not reachable',
            possibleCauses: [
                'Invalid DATABASE_URL environment variable',
                'Database server is offline',
                'SSL configuration missing (add ?sslmode=require)',
                'Network restriction — Vercel region cannot reach the DB host',
                'Connection pool exhausted',
            ],
            solutionHint: 'Check DATABASE_URL in Vercel Environment Variables and ensure the DB allows connections from Vercel IPs',
        }
    }

    if (err instanceof Prisma.PrismaClientValidationError) {
        return {
            statusCode: 400,
            errorType: ErrorType.PRISMA_ERROR,
            message: 'Invalid data passed to the database',
            possibleCauses: ['Missing required fields', 'Wrong data types', 'Unexpected fields in payload'],
            solutionHint: 'Review the request body against the expected schema',
        }
    }

    if (err instanceof Prisma.PrismaClientUnknownRequestError) {
        return {
            statusCode: 500,
            errorType: ErrorType.PRISMA_ERROR,
            message: 'An unknown database error occurred',
            possibleCauses: ['DB timeout', 'Unexpected Prisma engine error'],
            solutionHint: 'Check the server logs for the raw Prisma error',
        }
    }

    // ── CORS errors ───────────────────────────────────────────────────────────
    if (msg.toLowerCase().includes('cors') || msg.toLowerCase().includes('not allowed')) {
        return {
            statusCode: 403,
            errorType: ErrorType.CORS_ERROR,
            message: 'Frontend origin is not allowed by CORS policy',
            possibleCauses: [
                'The FRONTEND_URL environment variable does not include the calling origin',
                'HTTP vs HTTPS mismatch (http:// vs https://)',
                'Trailing slash or subdomain mismatch',
            ],
            solutionHint: 'Add the exact calling origin to the FRONTEND_URL variable in Vercel (no trailing slash)',
        }
    }

    // ── Auth errors ───────────────────────────────────────────────────────────
    if (
        err?.statusCode === 401 ||
        msg.includes('Unauthorized') ||
        msg.includes('Invalid token') ||
        msg.includes('jwt')
    ) {
        return {
            statusCode: 401,
            errorType: ErrorType.AUTH_ERROR,
            message: 'Authentication failed',
            possibleCauses: [
                'JWT token is missing, expired, or invalid',
                'JWT_SECRET mismatch between sign and verify',
                'Authorization header not sent or malformed',
            ],
            solutionHint: 'Re-login to obtain a fresh token. Ensure Bearer prefix is used in the Authorization header',
        }
    }

    // ── Server config errors ──────────────────────────────────────────────────
    if (
        msg.includes('Missing required environment') ||
        msg.includes('is missing') ||
        msg.includes('is not defined')
    ) {
        return {
            statusCode: 500,
            errorType: ErrorType.SERVER_CONFIG_ERROR,
            message: 'Server is misconfigured — required environment variable missing',
            possibleCauses: [
                'Environment variable not set in Vercel Project Settings',
                'Variable name typo',
                '.env file not loaded locally',
            ],
            solutionHint: 'Check Vercel → Project Settings → Environment Variables and compare with .env.example',
        }
    }

    // ── Validation errors (custom app-level) ───────────────────────────────────
    if (err?.statusCode === 400 || msg.includes('validation') || msg.includes('required')) {
        return {
            statusCode: 400,
            errorType: ErrorType.VALIDATION_ERROR,
            message: err.message || 'Request validation failed',
            possibleCauses: ['Missing required fields', 'Invalid field format', 'Schema mismatch'],
            solutionHint: 'Review the request body and ensure all required fields match the expected format',
        }
    }

    // ── Fallback ──────────────────────────────────────────────────────────────
    return {
        statusCode: err?.statusCode || 500,
        errorType: ErrorType.UNKNOWN_SERVER_ERROR,
        message: config.NODE_ENV === 'production'
            ? 'An unexpected server error occurred'
            : (msg || 'Unknown error'),
        possibleCauses: ['Unhandled exception in a route handler or service'],
        solutionHint: 'Check server logs for the full stack trace',
    }
}

// ─── Global Error Handler Middleware ─────────────────────────────────────────
// Must be registered LAST in app.ts (after all routes).
// Express identifies 4-arg middleware as error handlers — do NOT remove `next`.
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction
) => {
    // Always log server-side (full error including stack) using structured logger
    logger.error({
        msg: `${req.method} ${req.originalUrl}`,
        errorType: err?.errorType,
        errorMsg: err?.message,
        code: err?.code,
        stack: err?.stack,
    })

    const { statusCode, ...classified } = classifyError(err)

    const response: ClassifiedError = {
        success: false,
        ...classified,
        // Only expose stack in development — never in production
        ...(config.NODE_ENV !== 'production' && err?.stack
            ? { stack: err.stack }
            : {}),
    }

    return res.status(statusCode).json(response)
}

// ─── 404 Handler ─────────────────────────────────────────────────────────────
// Register this BEFORE errorHandler but AFTER all routes.
export const notFoundHandler = (req: Request, res: Response) => {
    const response: ClassifiedError = {
        success: false,
        errorType: ErrorType.ROUTE_NOT_FOUND,
        message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
        possibleCauses: [
            'Wrong URL path — double-check the API URL',
            'Incorrect HTTP method (GET vs POST vs PATCH etc.)',
            'Missing /api prefix — all routes are mounted under /api',
            'Base path mismatch between vercel.json routes and Express mount points',
            'Route not yet implemented',
        ],
        solutionHint: `Valid base paths: /api/cms/*, /api/admin/*, /api/health. Check backend/src/routes/*.ts for available endpoints`,
    }
    return res.status(404).json(response)
}
