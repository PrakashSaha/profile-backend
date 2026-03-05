import { Router } from 'express'
import { config } from '../config/env.js'
import { sendResponse } from '../utils/apiResponse.js'
import { checkPoolStatus } from '../lib/db/connection.js'

const router = Router()

/**
 * GET /api/health
 * Comprehensive health check for Vercel serverless and DB connectivity.
 */
router.get('/', async (_req, res) => {
    // Uses the new pooled connection with retry logic
    const dbStatus = await checkPoolStatus()

    return sendResponse(res, {
        status: dbStatus.ok ? 'ok' : 'error',
        database: dbStatus.ok ? 'connected' : 'disconnected',
        dbError: dbStatus.error ?? null,
        env: config.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }, dbStatus.ok ? 'Service is healthy' : 'Service is degraded')
})

export default router
