import prisma from '../../lib/prisma.js'

export const toolsService = {
    async getAll() {
        return prisma.toolCategory.findMany({
            include: { tools: true },
            orderBy: { name: 'asc' }
        })
    },

    async deleteCategory(id: string) {
        return prisma.toolCategory.delete({
            where: { id }
        })
    },

    async deleteTool(id: string) {
        return prisma.tool.delete({
            where: { id }
        })
    },

    async bulkSyncCategories(categories: any[]) {
        return prisma.$transaction(async (tx) => {
            const incomingCategoryIds: string[] = []

            for (const cat of categories) {
                const { id, tools, ...data } = cat
                let categoryId = id

                // Upsert category
                if (typeof id === 'string' && id.startsWith('cat-')) {
                    const created = await tx.toolCategory.create({
                        data: { ...data }
                    })
                    categoryId = created.id
                } else {
                    await tx.toolCategory.upsert({
                        where: { id: id || '' },
                        update: data,
                        create: data,
                    })
                }
                incomingCategoryIds.push(categoryId)

                // Sync tools for this category
                if (tools && Array.isArray(tools)) {
                    const incomingToolIds: string[] = []
                    for (const tool of tools) {
                        const toolData = typeof tool === 'string' ? { name: tool } : { name: tool.name }
                        const toolId = typeof tool === 'object' ? tool.id : null

                        if (!toolId || (typeof toolId === 'string' && toolId.startsWith('tool-'))) {
                            const created = await tx.tool.create({
                                data: { ...toolData, categoryId }
                            })
                            incomingToolIds.push(created.id)
                        } else {
                            await tx.tool.upsert({
                                where: { id: toolId },
                                update: toolData,
                                create: { ...toolData, categoryId }
                            })
                            incomingToolIds.push(toolId)
                        }
                    }

                    // Delete tools not in current set for THIS category
                    await tx.tool.deleteMany({
                        where: {
                            categoryId: categoryId,
                            id: { notIn: incomingToolIds }
                        }
                    })
                }
            }

            // Delete categories not in current set
            await tx.toolCategory.deleteMany({
                where: {
                    id: { notIn: incomingCategoryIds }
                }
            })

            return tx.toolCategory.findMany({ include: { tools: true } })
        }, { timeout: 30000 })
    }
}
