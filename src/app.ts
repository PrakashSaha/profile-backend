import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { config } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import cmsRoutes from './routes/cms.routes.js'
import adminRoutes from './routes/admin.routes.js'
import { sendResponse } from './utils/apiResponse.js'

const app = express()

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({
    // Content-Security-Policy can be customised later; start with defaults
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

// ─── Structured Request Logging ───────────────────────────────────────────────
app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
        const duration = Date.now() - start
        const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO'
        console.log(
            `[${level}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)` +
            (req.ip ? ` | ip=${req.ip}` : '')
        )
    })
    next()
})

// ─── Routes ───────────────────────────────────────────────────────────────────
// All routes are mounted under /api to match vercel.json routing and avoid 404s.

// Public CMS data endpoints (read-only portfolio content)
app.use('/api/cms', cmsRoutes)

// Protected admin endpoints (auth + CRUD)
app.use('/api/admin', adminRoutes)

// Health check — useful for Vercel deploy checks and uptime monitors
app.get('/api/health', async (_req, res) => {
    return sendResponse(res, {
        status: 'ok',
        env: config.NODE_ENV,
        timestamp: new Date().toISOString(),
    })
})

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

export default app
