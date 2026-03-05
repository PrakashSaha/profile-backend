import { Router } from 'express'
import { blogController } from '../modules/blog/blog.controller.js'
import { projectController } from '../modules/project/project.controller.js'
import { heroController } from '../modules/hero/hero.controller.js'
import { toolsController } from '../modules/tools/tools.controller.js'
import { experienceController } from '../modules/experience/experience.controller.js'
import { processController } from '../modules/process/process.controller.js'
import { messagesController } from '../modules/messages/messages.controller.js'
import { bentoController } from '../modules/bento/bento.controller.js'
import { credentialsController } from '../modules/credentials/credentials.controller.js'
import { cmsController } from '../modules/cms/cms.controller.js'

const router = Router()

// Cache-Control middleware for public GET routes
// Vercel edge CDN caches for 60s; serves stale while revalidating in background (up to 5 min)
const publicCacheHeaders = (_req: any, res: any, next: any) => {
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    next()
}

// ─── Homepage batch endpoint ─────────────────────────────────────────────────
// Single request replaces 7 parallel client-side fetches.
// Used by the homepage Server Component for ISR pre-fetching.
router.get('/homepage', publicCacheHeaders, cmsController.getHomepage)

// ─── Public Read-Only CMS Routes ─────────────────────────────────────────────
router.get('/blogs', publicCacheHeaders, blogController.getPosts)
router.get('/blog', publicCacheHeaders, blogController.getPosts)
router.get('/blogs/:slug', publicCacheHeaders, blogController.getPostBySlug)
router.get('/blog/:slug', publicCacheHeaders, blogController.getPostBySlug)
router.get('/projects', publicCacheHeaders, projectController.getProjects)
router.get('/projects/:slug', publicCacheHeaders, projectController.getProjectBySlug)
router.get('/hero', publicCacheHeaders, heroController.getHero)
router.get('/tools', publicCacheHeaders, toolsController.getCategories)
router.get('/experience', publicCacheHeaders, experienceController.getExperience)
router.get('/career', publicCacheHeaders, experienceController.getExperience)
router.get('/process', publicCacheHeaders, processController.getSteps)
router.get('/bento', publicCacheHeaders, bentoController.getBento)
router.get('/credentials', publicCacheHeaders, credentialsController.getCredentials)

// ─── Aggregate route for Admin Dashboard ─────────────────────────────────────
router.get('/posts', cmsController.getAdminPosts)

// ─── Public Messaging ─────────────────────────────────────────────────────────
router.post('/messages', messagesController.createMessage)
router.get('/messages', messagesController.getMessages)

export default router

