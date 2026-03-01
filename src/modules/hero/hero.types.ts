import { z } from 'zod'

export const heroSchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Name is required'),
        role: z.string().min(1, 'Role is required'),
        bio: z.string().min(1, 'Bio is required'),
        company: z.string().min(1, 'Company is required'),
        location: z.string().min(1, 'Location is required'),
        image: z.string().min(1, 'Image is required'),
        logoLink: z.string().optional(),
        socials: z.array(z.object({
            label: z.string(),
            href: z.string(),
            icon: z.string()
        })).optional().nullable(),
    }),
})

export type UpdateHeroInput = z.infer<typeof heroSchema>['body']
