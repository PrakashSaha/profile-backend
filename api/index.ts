// ─── Vercel Serverless Entry Point ───────────────────────────────────────────
// This file is the ONLY file Vercel invokes.
// It MUST NOT call app.listen() — Vercel manages the HTTP server lifecycle.
// All requests routed via vercel.json → api/index.ts → Express app.
import app from '../src/app.js'
import { checkDatabaseConnection } from '../src/lib/prisma.js'

// Probe the database on cold start so misconfigured DATABASE_URLs surface
// immediately as a clear DATABASE_ERROR rather than an opaque 500 later.
checkDatabaseConnection().then(({ connected, error }) => {
    if (!connected) {
        console.error('[STARTUP] ⚠️  Database connectivity check FAILED:', error)
        console.error('[STARTUP]    Requests will receive DATABASE_ERROR responses until this is resolved.')
        console.error('[STARTUP]    Possible causes: invalid DATABASE_URL, DB offline, SSL missing.')
    } else {
        console.log('[STARTUP] ✅ Database connection verified.')
    }
})

export default app
