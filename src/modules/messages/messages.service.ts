import prisma from '../../lib/prisma.js'

export const messagesService = {
    async getAll() {
        return (prisma as any).message.findMany({ orderBy: { createdAt: 'desc' } })
    },

    async create(data: { name: string, email: string, subject: string, message: string }) {
        return (prisma as any).message.create({ data })
    },

    async markAsRead(id: string) {
        return (prisma as any).message.update({
            where: { id },
            data: { read: true }
        })
    },

    async delete(id: string) {
        return (prisma as any).message.delete({
            where: { id }
        })
    }
}
