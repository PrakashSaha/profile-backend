import pino from 'pino';
import { config } from '../config/env.js';

/**
 * 🛡️ Centralized Structured Logger (Pino)
 * 
 * Why Pino?
 * 1. Performance: Extremely low overhead, designed for production speed.
 * 2. Structured: Outputs JSON logs by default, perfect for log aggregation 
 *    (Vercel, Datadog, ELK).
 * 3. Standardized: Provides levels (fatal, error, warn, info, debug, trace).
 */

const logger = pino({
    level: config.LOG_LEVEL || 'info',
    // In development, use pino-pretty for human-readable console output
    transport: config.NODE_ENV === 'development' ? {
        target: 'pino-pretty',
        options: {
            colorize: true,
            ignore: 'pid,hostname',
            translateTime: 'HH:MM:ss Z',
        }
    } : undefined,
    // Standardize log fields for better querying in production
    base: {
        env: config.NODE_ENV,
    }
});

export default logger;
