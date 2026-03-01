import prisma from '../../lib/prisma.js'
import { CreateProjectInput } from './project.types.js'

export const projectService = {
    async getAll() {
        return prisma.project.findMany({
            orderBy: { updatedAt: 'desc' }
        })
    },

    async getBySlug(slug: string) {
        return prisma.project.findUnique({
            where: { slug }
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
                    await tx.project.upsert({
                        where: { id: id || '' },
                        update: data,
                        create: data
                    })
                    if (id) incomingIds.push(id)
                }
            }

            await tx.project.deleteMany({
                where: { id: { notIn: incomingIds } }
            })

            return tx.project.findMany({ orderBy: { updatedAt: 'desc' } })
        }, { timeout: 30000 })
    }
}
