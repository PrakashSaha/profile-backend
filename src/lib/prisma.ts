import { PrismaClient } from '@prisma/client'

// ─── Serverless-Safe Prisma Singleton ────────────────────────────────────────
// On Vercel, modules are re-evaluated on cold starts but the Node.js process
// may be reused across warm invocations. Storing the client on `globalThis`
// prevents the "too many connections" problem from creating a new PrismaClient
// on every warm invocation.

declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
    return new PrismaClient({
        log: process.env.NODE_ENV === 'development'
            ? ['query', 'warn', 'error']
            : ['error'],
        datasources: {
            db: {
                // Always read directly from process.env so Prisma picks up the
                // Vercel-injected variable even before our config module loads.
                url: process.env.DATABASE_URL,
            },
        },
    })
}

export const prisma: PrismaClient =
    globalThis.__prisma ?? createPrismaClient()

// Only cache the instance outside production to avoid cross-request leakage
// in multi-tenant environments. In production every warm function reuse is
// safe because Vercel isolates executions within the same process anyway.
if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = prisma
} else {
    // In production, also cache it so the SAME function instance reuses the
    // connection pool rather than opening a new one on every warm request.
    globalThis.__prisma = prisma
}

// ─── DB Connectivity Health Check ────────────────────────────────────────────
// Call this once on startup (in api/index.ts) to detect misconfigured URLs
// or unreachable databases before any request is served.
export async function checkDatabaseConnection(): Promise<{
    connected: boolean
    error?: string
}> {
    try {
        await prisma.$queryRaw`SELECT 1`
        return { connected: true }
    } catch (err: any) {
        return {
            connected: false,
            error: err?.message ?? 'Unknown database error',
        }
    }
}

export default prisma
