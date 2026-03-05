import { query } from '../../lib/db/connection.js';

/**
 * Example Service Layer using the Pooled Connection
 * 
 * This demonstrates how to use the singleton query function which 
 * automatically handles Neon cold starts and retries.
 */
export class ProjectAnalyticsService {
    /**
     * Fetches project statistics using a direct SQL query.
     * Benefit: Bypasses Prisma for high-performance or complex queries 
     * while benefiting from the centralized pool and retry logic.
     */
    static async getProjectStats() {
        const sql = `
      SELECT 
        COUNT(*) as total_projects,
        SUM(stars) as total_stars,
        AVG(forks) as avg_forks
      FROM "Project"
    `;

        try {
            // The query function here handles the 'pg' pool and Neon wake-up retries
            const result = await query(sql);

            if (result.rows.length > 0) {
                return result.rows[0];
            }

            return {
                total_projects: 0,
                total_stars: 0,
                avg_forks: 0
            };
        } catch (error) {
            // Error handling is already partially handled in query(), 
            // but we can add service-specific logic here.
            throw new Error(`Failed to fetch project stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
