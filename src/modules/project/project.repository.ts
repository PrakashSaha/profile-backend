import prisma from '../../lib/prisma.js'
import { CreateProjectInput } from './project.types.js'

/**
 * 🗄️ Project Repository
 * 
 * Responsibilities:
 * - Direct database access using Prisma.
 * - Encapsulating raw data fetching logic.
 * - Mapping database models to domain types (if necessary).
 */
export const projectRepository = {
    async findAll() {
        return prisma.project.findMany({
            orderBy: { updatedAt: 'desc' }
        })
    },

    async findPinned(take: number = 2) {
        return prisma.project.findMany({
            where: { pinned: true },
            orderBy: { updatedAt: 'desc' },
            take
        })
    },

    async findLatestNonPinned(excludeIds: string[], take: number) {
        return prisma.project.findMany({
            where: {
                id: { notIn: excludeIds }
            },
            orderBy: { updatedAt: 'desc' },
            take
        })
    },

    async findBySlug(slug: string) {
        return prisma.project.findUnique({
            where: { slug }
        })
    },

    async findById(id: string) {
        return prisma.project.findUnique({
            where: { id }
        })
    },

    async create(data: CreateProjectInput) {
        return prisma.project.create({
            data
        })
    },

    async update(id: string, data: Partial<CreateProjectInput>) {
        return prisma.project.update({
            where: { id },
            data
        })
    },

    async delete(id: string) {
        return prisma.project.delete({
            where: { id }
        })
    },

    async deleteNotInIds(ids: string[], tx?: any) {
        const client = tx || prisma
        return client.project.deleteMany({
            where: { id: { notIn: ids } }
        })
    }
}
