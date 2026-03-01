import { z } from 'zod'

export const projectSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required').max(200),
        slug: z.string().min(1, 'Slug is required'),
        description: z.string().min(1, 'Description is required'),
        fullDescription: z.string().optional().nullable(),
        image: z.string().min(1, 'Image is required'),
        icon: z.string().min(1, 'Icon is required'),
        type: z.string().min(1, 'Type is required'),
        tech: z.array(z.string()),
        stars: z.number().int().nonnegative().optional(),
        forks: z.number().int().nonnegative().optional(),
        watchers: z.number().int().nonnegative().optional(),
        updatedAt: z.string(),
        link: z.string().optional().nullable(),
        pinned: z.boolean().optional(),
    }),
})

export type CreateProjectInput = z.infer<typeof projectSchema>['body']
