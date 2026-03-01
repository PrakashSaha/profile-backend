import { Router } from 'express'
import { config } from '../config/env.js'
import { sendResponse } from '../utils/apiResponse.js'
import { checkDatabaseConnection } from '../lib/prisma.js'

const router = Router()

/**
 * GET /api/health
 * Comprehensive health check for Vercel serverless and DB connectivity.
 */
router.get('/', async (_req, res) => {
    const dbStatus = await checkDatabaseConnection()

    return sendResponse(res, {
        status: 'ok',
        database: dbStatus.connected ? 'connected' : 'disconnected',
        dbError: dbStatus.error ?? null,
        env: config.NODE_ENV,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }, dbStatus.connected ? 'Service is healthy' : 'Service is degraded')
})

export default router
