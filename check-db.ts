import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const tools = await prisma.toolCategory.count()
    const posts = await prisma.blogPost.count()
    const users = await prisma.user.count()
    console.log(JSON.stringify({ tools, posts, users }))
}

main().catch(console.error).finally(() => prisma.$disconnect())
