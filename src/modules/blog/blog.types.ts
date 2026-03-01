import { z } from 'zod'

export const blogPostSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required').max(200),
        subtitle: z.string().optional(),
        slug: z.string().min(1, 'Slug is required'),
        excerpt: z.string().min(1, 'Excerpt is required'),
        content: z.string().min(1, 'Content is required'),
        image: z.string().min(1, 'Image URI is required'),
        date: z.string(),
        readTime: z.string(),
        category: z.string(),
        author: z.string(),
        authorRole: z.string(),
        tags: z.array(z.string()),
        pinned: z.boolean().optional(),
    }),
})

export type CreateBlogPostInput = z.infer<typeof blogPostSchema>['body']
