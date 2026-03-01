import prisma from '../../lib/prisma.js'

export const credentialsService = {
    async getAll() {
        return prisma.credential.findMany({ orderBy: { date: 'desc' } })
    },

    async delete(id: string) {
        return prisma.credential.delete({
            where: { id }
        })
    },

    async bulkSync(credentials: any[]) {
        if (!Array.isArray(credentials)) {
            throw new Error('Expected an array of credentials')
        }

        return prisma.$transaction(async (tx) => {
            const incomingIds: string[] = []
            for (const cred of credentials) {
                const { id, ...data } = cred
                const isNew = typeof id === 'string' && id.startsWith('cred-')

                if (isNew) {
                    const created = await tx.credential.create({ data })
                    incomingIds.push(created.id)
                } else {
                    await tx.credential.upsert({
                        where: { id: id || '' },
                        update: data,
                        create: data
                    })
                    if (id) incomingIds.push(id)
                }
            }

            await tx.credential.deleteMany({
                where: { id: { notIn: incomingIds } }
            })

            return tx.credential.findMany({ orderBy: { date: 'desc' } })
        }, { timeout: 30000 })
    }
}
