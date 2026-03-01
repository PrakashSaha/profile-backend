import prisma from '../../lib/prisma.js'

export const experienceService = {
    async getAll() {
        const experiences = await prisma.experience.findMany({ orderBy: { period: 'desc' } })
        const education = await prisma.education.findMany({ orderBy: { period: 'desc' } })
        return { experiences, education }
    },

    async deleteExperience(id: string) {
        return prisma.experience.delete({
            where: { id }
        })
    },

    async deleteEducation(id: string) {
        return prisma.education.delete({
            where: { id }
        })
    },

    async bulkSyncExperience(experiences: any[], education: any[]) {
        return prisma.$transaction(async (tx) => {
            // Experiences
            if (experiences && Array.isArray(experiences)) {
                const incomingExpIds: string[] = []
                for (const exp of experiences) {
                    const { id, ...data } = exp
                    const isNew = typeof id === 'string' && id.startsWith('exp-')

                    if (isNew) {
                        const created = await tx.experience.create({ data })
                        incomingExpIds.push(created.id)
                    } else {
                        await tx.experience.upsert({
                            where: { id: id || '' },
                            update: data,
                            create: data
                        })
                        if (id) incomingExpIds.push(id)
                    }
                }
                await tx.experience.deleteMany({
                    where: { id: { notIn: incomingExpIds } }
                })
            }

            // Education
            if (education && Array.isArray(education)) {
                const incomingEduIds: string[] = []
                for (const edu of education) {
                    const { id, ...data } = edu
                    const isNew = typeof id === 'string' && id.startsWith('edu-')

                    if (isNew) {
                        const created = await tx.education.create({ data })
                        incomingEduIds.push(created.id)
                    } else {
                        await tx.education.upsert({
                            where: { id: id || '' },
                            update: data,
                            create: data
                        })
                        if (id) incomingEduIds.push(id)
                    }
                }
                await tx.education.deleteMany({
                    where: { id: { notIn: incomingEduIds } }
                })
            }

            const experiencesResult = await tx.experience.findMany({ orderBy: { period: 'desc' } })
            const educationResult = await tx.education.findMany({ orderBy: { period: 'desc' } })
            return { experiences: experiencesResult, education: educationResult }
        }, { timeout: 30000 })
    }
}
