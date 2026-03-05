import { projectRepository } from './project.repository.js'
import { CreateProjectInput } from './project.types.js'
import prisma from '../../lib/prisma.js'

/**
 * 🏗️ Project Service
 * 
 * Responsibilities:
 * - Orchestrating business logic.
 * - Coordination between multiple repositories or external services.
 * - Validation and formatting of business data.
 */
export const projectService = {
    async getAll() {
        return projectRepository.findAll()
    },

    async getHome() {
        // Business Rule: Fetch up to 2 pinned first, fill with latest non-pinned
        const pinned = await projectRepository.findPinned(2)

        if (pinned.length >= 2) return pinned

        const latest = await projectRepository.findLatestNonPinned(
            pinned.map(p => p.id),
            2 - pinned.length
        )

        return [...pinned, ...latest]
    },

    async getBySlug(slug: string) {
        return projectRepository.findBySlug(slug)
    },

    async create(data: CreateProjectInput) {
        return projectRepository.create(data)
    },

    async update(id: string, data: Partial<CreateProjectInput>) {
        return projectRepository.update(id, data)
    },

    async delete(id: string) {
        return projectRepository.delete(id)
    },

    /**
     * Synchronizes a list of projects with the database.
     * Complex business logic involving a transaction and multiple repository calls.
     */
    async bulkSync(projects: any[]) {
        return prisma.$transaction(async (tx) => {
            const incomingIds: string[] = []

            for (const proj of projects) {
                const { id, ...data } = proj
                const isNew = typeof id === 'string' && id.startsWith('proj-')

                if (isNew) {
                    const created = await tx.project.create({ data })
                    incomingIds.push(created.id)
                } else {
                    // Note: Upsert is still a low-level Prisma op; for a full refactor 
                    // we might add a repo method for this, but keeping here for the demo.
                    await tx.project.upsert({
                        where: { id: id || '' },
                        update: data,
                        create: data
                    })
                    if (id) incomingIds.push(id)
                }
            }

            // Centralized repo method call
            await projectRepository.deleteNotInIds(incomingIds, tx)

            return tx.project.findMany({ orderBy: { updatedAt: 'desc' } })
        }, { timeout: 30000 })
    }
}
