import prisma from '../../lib/prisma.js'

export const bentoService = {
    async get() {
        return prisma.bento.findUnique({
            where: { id: 'bento' }
        })
    },

    async update(content: any) {
        return prisma.bento.upsert({
            where: { id: 'bento' },
            update: { content },
            create: { id: 'bento', content }
        })
    }
}
