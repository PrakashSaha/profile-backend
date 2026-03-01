import prisma from '../../lib/prisma.js'
import { UpdateHeroInput } from './hero.types.js'

export const heroService = {
    async get() {
        return prisma.hero.findUnique({
            where: { id: 'hero' }
        })
    },

    async update(data: UpdateHeroInput) {
        return prisma.hero.upsert({
            where: { id: 'hero' },
            update: data as any,
            create: { ...data, id: 'hero' } as any
        })
    }
}
