import { Response } from 'express'

// ─── Standard API Response Shape ─────────────────────────────────────────────
export interface ApiResponse<T = any> {
    success: boolean
    data: T | null
    message?: string | null
    error?: string | null
}

// ─── Success Response ─────────────────────────────────────────────────────────
export const sendResponse = <T>(
    res: Response,
    data: T | null,
    message: string | null = null,
    success = true,
    statusCode = 200
) => {
    const body: ApiResponse<T> = { success, data }
    if (message) body.message = message
    return res.status(statusCode).json(body)
}

// ─── Simple Error Response ────────────────────────────────────────────────────
// Use for inline controller-level errors (validation, not-found, etc.)
// For unhandled exceptions, throw and let the global errorHandler classify them.
export const sendError = (
    res: Response,
    message: string,
    statusCode = 500
) => {
    return res.status(statusCode).json({
        success: false,
        data: null,
        error: message,
    })
}
