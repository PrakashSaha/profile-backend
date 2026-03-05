import prisma from '../../lib/prisma.js'
import { CreateBlogPostInput } from './blog.types.js'

/**
 * 🗄️ Blog Repository
 * 
 * Responsibilities:
 * - Direct database access for blog posts.
 * - Mapping database models to domain types.
 */
export const blogRepository = {
    async findAll() {
        return prisma.blogPost.findMany({
            orderBy: { date: 'desc' }
        })
    },

    async findPinned(take: number = 2) {
        return prisma.blogPost.findMany({
            where: { pinned: true },
            orderBy: { date: 'desc' },
            take
        })
    },

    async findLatestNonPinned(excludeIds: string[], take: number) {
        return prisma.blogPost.findMany({
            where: {
                id: { notIn: excludeIds }
            },
            orderBy: { date: 'desc' },
            take
        })
    },

    async findBySlug(slug: string) {
        return prisma.blogPost.findUnique({
            where: { slug }
        })
    },

    async create(data: CreateBlogPostInput) {
        return prisma.blogPost.create({
            data
        })
    },

    async update(id: string, data: Partial<CreateBlogPostInput>) {
        return prisma.blogPost.update({
            where: { id },
            data
        })
    },

    async delete(id: string) {
        return prisma.blogPost.delete({
            where: { id }
        })
    },

    async deleteNotInIds(ids: string[], tx?: any) {
        const client = tx || prisma
        return client.blogPost.deleteMany({
            where: { id: { notIn: ids } }
        })
    }
}
