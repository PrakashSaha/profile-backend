import prisma from '../../lib/prisma.js'
import { CreateBlogPostInput } from './blog.types.js'

export const blogService = {
    async getAll() {
        return prisma.blogPost.findMany({
            orderBy: { date: 'desc' }
        })
    },

    async getBySlug(slug: string) {
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

            await tx.blogPost.deleteMany({
                where: { id: { notIn: incomingIds } }
            })

            return tx.blogPost.findMany({ orderBy: { date: 'desc' } })
        }, { timeout: 30000 })
    }
}
