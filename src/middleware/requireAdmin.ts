import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { config } from '../config/env.js'
import { sendError } from '../utils/apiResponse.js'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL as string

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 'Unauthorized: No token provided', 401)
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET) as { email: string }

        if (decoded.email !== ADMIN_EMAIL) {
            return sendError(res, 'Forbidden: Insufficient permissions', 403)
        }

        (req as any).user = decoded
        next()
    } catch (error) {
        return sendError(res, 'Unauthorized: Invalid or expired token', 401)
    }
}
