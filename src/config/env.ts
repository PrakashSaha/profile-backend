import dotenv from 'dotenv'
import { z } from 'zod'

// Load .env file in non-production environments
dotenv.config()

// ─── Environment Schema ───────────────────────────────────────────────────────
// All required variables are listed here. Missing variables crash the process
// early with a human-readable message instead of failing silently at runtime.
// NOTE: Using Zod v4 API — z.string().nonempty() for required strings.

const envSchema = z.object({
    DATABASE_URL: z
        .string()
        .min(1, '❌ DATABASE_URL is missing or empty — add it to Vercel Environment Variables or your .env file'),

    JWT_SECRET: z
        .string()
        .min(16, '❌ JWT_SECRET must be at least 16 characters — generate one with: openssl rand -hex 64'),

    ADMIN_EMAIL: z
        .string()
        .email('❌ ADMIN_EMAIL must be a valid email address'),

    ADMIN_SECRET: z
        .string()
        .min(8, '❌ ADMIN_SECRET must be at least 8 characters — set a secure admin password/secret'),

    FRONTEND_URL: z.string().default('http://localhost:3000'),
    PORT: z.string().default('5001'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// ─── Parse & Validate ─────────────────────────────────────────────────────────
const parseResult = envSchema.safeParse(process.env)

if (!parseResult.success) {
    const errors = parseResult.error.issues.map(
        (issue) => `  • ${String(issue.path[0] ?? 'unknown')}: ${issue.message}`
    )
    console.error('\n🚨 [ENV] Application startup aborted — environment misconfiguration:\n')
    console.error(errors.join('\n'))
    console.error('\n📖 See .env.example for required variables.\n')
    process.exit(1)
}

export const config = parseResult.data
export type Config = typeof config
