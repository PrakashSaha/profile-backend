import pg from 'pg';
const { Pool } = pg;

/**
 * 🧱 Neon Database Connection Module (Singleton Pattern)
 * 
 * Why Singleton Pooling?
 * 1. Connection Explosion Prevention: In serverless environments like Next.js or Vercel, 
 *    multiple function invocations can lead to a surge in database connections. 
 *    A singleton pool ensures that a single process (or warm instance) reuses a 
 *    limited set of connections rather than opening a new one per request.
 * 
 * 2. Neon Cold Start Mitigation: Neon compute instances can go into "idle" mode. 
 *    The first query to an idle instance triggers a "cold start" (wake-up).
 *    Pooling keeps a few connections "warm" during active periods, and our 
 *    centralized `query` function includes automatic retry logic to handle 
 *    the wake-up delay gracefully.
 */

// Use local variable for singleton to support hot-reloading/process reuse in development
let pool: pg.Pool;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    throw new Error('[DB] DATABASE_URL is not defined in environment variables');
}

// Initialize the pool only once
if (!globalThis.pool) {
    console.log('[DB] Initializing new singleton connection pool');
    globalThis.pool = new Pool({
        connectionString: DATABASE_URL,
        max: 10, // Max concurrent connections per instance
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    });
}

pool = globalThis.pool;

/**
 * Reusable Query Function with Automatic Retry Logic
 * Handles common Neon wake-up issues (cold starts).
 */
export async function query(text: string, params?: any[], retryCount = 0): Promise<pg.QueryResult> {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (err: any) {
        const duration = Date.now() - start;

        // Detect Neon wake-up/cold start errors
        // Common error messages or codes that indicate the compute is waking up
        const isWakingUp =
            err.message.includes('connection timeout') ||
            err.message.includes('EOF') ||
            err.code === '57P01'; // Database is shutting down (or waking up)

        if (isWakingUp && retryCount < 2) {
            const delay = 2000; // Wait 2 seconds before retry
            console.warn(`[DB] Neon wake-up detected (Attempt ${retryCount + 1}). Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return query(text, params, retryCount + 1);
        }

        // Comprehensive Error Handling
        console.error(`[DB] Query Error after ${duration}ms:`, {
            message: err.message,
            code: err.code,
            query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        });

        if (err.message.includes('not connected') || err.message.includes('network')) {
            throw new Error('Database connection failed. Please check network or Neon status.');
        }

        throw err;
    }
}

/**
 * Health Check Utility
 */
export async function checkPoolStatus() {
    try {
        const result = await query('SELECT 1');
        return { ok: result.rowCount === 1 };
    } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : 'Unknown connection error' };
    }
}

export default {
    pool,
    query,
    checkPoolStatus
};

// Types for global singleton
declare global {
    var pool: pg.Pool | undefined;
}
