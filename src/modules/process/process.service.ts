import prisma from '../../lib/prisma.js'

export const processService = {
    async getAll() {
        return (prisma as any).engineeringStep.findMany({ orderBy: { order: 'asc' } })
    },

    async delete(id: string) {
        return (prisma as any).engineeringStep.delete({
            where: { id }
        })
    },

    async bulkSync(steps: any[]) {
        if (!Array.isArray(steps)) {
            throw new Error('Expected an array of steps')
        }

        return prisma.$transaction(async (tx) => {
            const incomingIds: string[] = []
            for (let i = 0; i < steps.length; i++) {
                const { id, ...data } = steps[i]
                const stepData = { ...data, order: i }
                const isNew = typeof id === 'string' && id.startsWith('proc-')

                if (isNew) {
                    const created = await (tx as any).engineeringStep.create({ data: stepData })
                    incomingIds.push(created.id)
                } else {
                    await (tx as any).engineeringStep.upsert({
                        where: { id: id || '' },
                        update: stepData,
                        create: stepData
                    })
                    if (id) incomingIds.push(id)
                }
            }

            await (tx as any).engineeringStep.deleteMany({
                where: { id: { notIn: incomingIds } }
            })

            return (tx as any).engineeringStep.findMany({ orderBy: { order: 'asc' } })
        }, { timeout: 30000 })
    }
}
