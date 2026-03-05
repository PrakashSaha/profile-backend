import { blogRepository } from './blog.repository.js'
import { CreateBlogPostInput } from './blog.types.js'
import prisma from '../../lib/prisma.js'

/**
 * 🏗️ Blog Service
 * 
 * Responsibilities:
 * - Orchestrating blog-related business logic.
 * - Coordination of repository calls and complex CRUD operations.
 */
export const blogService = {
    async getAll() {
        return blogRepository.findAll()
    },

    async getHome() {
        // Business Rule: Fetch up to 2 pinned first, fill with latest non-pinned
        const pinned = await blogRepository.findPinned(2)

        if (pinned.length >= 2) return pinned

        const latest = await blogRepository.findLatestNonPinned(
            pinned.map(p => p.id),
            2 - pinned.length
        )

        return [...pinned, ...latest]
    },

    async getBySlug(slug: string) {
        return blogRepository.findBySlug(slug)
    },

    async create(data: CreateBlogPostInput) {
        return blogRepository.create(data)
    },

    async update(id: string, data: Partial<CreateBlogPostInput>) {
        return blogRepository.update(id, data)
    },

    async delete(id: string) {
        return blogRepository.delete(id)
    },

    /**
     * Synchronizes blog posts with the database.
     */
    async bulkSync(posts: any[]) {
        return prisma.$transaction(async (tx) => {
            const incomingIds: string[] = []

            for (const post of posts) {
                const { id, ...data } = post
                const isNew = typeof id === 'string' && id.startsWith('blog-')

                if (isNew) {
                    const created = await tx.blogPost.create({ data })
                    incomingIds.push(created.id)
                } else {
                    await tx.blogPost.upsert({
                        where: { id: id || '' },
                        update: data,
                        create: data
                    })
                    if (id) incomingIds.push(id)
                }
            }

            await blogRepository.deleteNotInIds(incomingIds, tx)

            return tx.blogPost.findMany({ orderBy: { date: 'desc' } })
        }, { timeout: 30000 })
    }
}
