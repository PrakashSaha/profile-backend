import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'
import { pinoHttp } from 'pino-http'
import logger from './lib/logger.js'

import { config } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import cmsRoutes from './routes/cms.js'
import adminRoutes from './routes/admin.js'
import healthRoutes from './routes/health.js'

const app = express()

// ─── Logging Middleware ──────────────────────────────────────────────────────
// Standardized JSON request logs for production observability.
app.use(pinoHttp({
    logger,
    // Add request ID headers for easier trace analysis
    genReqId: (req) => {
        const id = req.headers['x-request-id']
        if (Array.isArray(id)) return id[0] ?? Math.random().toString(36).substring(7)
        return id ?? Math.random().toString(36).substring(7)
    },
}))

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
    // Content-Security-Policy: restrict where scripts/styles can be loaded from
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://vercel.live"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https://api.microlink.io"],
            connectSrc: ["'self'", "https://api.microlink.io", "https://*.neon.tech"],
        },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow CDN-served assets
}))

// ─── CORS ─────────────────────────────────────────────────────────────────────
// Supports comma-separated list: "https://foo.vercel.app,https://bar.com"
const allowedOrigins = config.FRONTEND_URL.split(',').map((o) => o.trim()).filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (server-to-server, curl, Postman, health checks)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        // Return a typed Error — the global error handler will classify it as CORS_ERROR
        const err = new Error(`CORS: origin ${origin} is not allowed`) as any
        err.statusCode = 403
        return callback(err)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ─── Body Parsing & Compression ───────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))        // tightened from 10mb — increase only if needed
app.use(express.urlencoded({ extended: true, limit: '2mb' }))
app.use(compression())                          // gzip responses for CDN + client perf

// ─── Rate Limiting ────────────────────────────────────────────────────────────
// Serverless-friendly: in-memory limiter resets on cold start, but still
// protects against burst abuse within a single function instance.
const globalLimiter = rateLimit({
    windowMs: 60 * 1000,   // 1 minute
    max: 120,              // 120 req/min per IP (generous for a portfolio API)
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        errorType: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests — please slow down',
        possibleCauses: ['Automated script or bot hitting the API', 'Excessive polling from the frontend'],
        solutionHint: 'Reduce request frequency or implement client-side caching',
    },
})

// Stricter limiter on the auth endpoint to mitigate brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 10,                    // 10 login attempts per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        errorType: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts — please wait 15 minutes',
        possibleCauses: ['Brute-force login attempt', 'Repeated failed logins'],
        solutionHint: 'Wait 15 minutes before trying again',
    },
})

app.use(globalLimiter)
app.use('/api/admin/login', authLimiter)

// ─── Root Route ───────────────────────────────────────────────────────────────
// Handles GET / for the vercel.json root route entry.
// Returns a human-friendly confirmation that the API server is running.
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'API Server Running',
        version: '1.0.0',
        docs: '/api/health',
    })
})

// ─── Routes ───────────────────────────────────────────────────────────────────
// All routes are mounted under /api to match vercel.json routing and avoid 404s.

// Public CMS data endpoints (read-only portfolio content)
app.use('/api/cms', cmsRoutes)

// Protected admin endpoints (auth + CRUD)
app.use('/api/admin', adminRoutes)

// Health check — useful for Vercel deploy checks and uptime monitors
app.use('/api/health', healthRoutes)

// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
// IMPORTANT: notFoundHandler MUST be registered AFTER all routes.
// IMPORTANT: errorHandler MUST be last — Express identifies it by the 4-arg signature.
app.use(notFoundHandler)
app.use(errorHandler)

// ─── Unhandled Rejection Safety Net ──────────────────────────────────────────
// Catches any Promise rejection that escapes a route handler without next(err).
process.on('unhandledRejection', (reason: any) => {
    console.error('[FATAL] Unhandled Promise Rejection:', reason?.message ?? reason)
    // Do NOT crash the process in serverless — log and continue.
})

process.on('uncaughtException', (error: Error) => {
    console.error('[FATAL] Uncaught Exception:', error.message, error.stack)
    // In serverless, Vercel will restart the function if needed.
})

// Log basic startup info
logger.info({
    msg: 'Backend initialized',
    port: config.PORT,
    env: config.NODE_ENV,
    db: 'Neon (Pooled Connection)',
})

export default app
