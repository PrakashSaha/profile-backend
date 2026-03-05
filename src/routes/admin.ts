import { Router } from 'express'
import { blogController } from '../modules/blog/blog.controller.js'
import { projectController } from '../modules/project/project.controller.js'
import { heroController } from '../modules/hero/hero.controller.js'
import { toolsController } from '../modules/tools/tools.controller.js'
import { experienceController } from '../modules/experience/experience.controller.js'
import { processController } from '../modules/process/process.controller.js'
import { messagesController } from '../modules/messages/messages.controller.js'
import { authController } from '../modules/auth/auth.controller.js'
import { bentoController } from '../modules/bento/bento.controller.js'
import { credentialsController } from '../modules/credentials/credentials.controller.js'
import { cmsController } from '../modules/cms/cms.controller.js'
import { requireAdmin } from '../middleware/requireAdmin.js'
import { sendResponse, sendError } from '../utils/apiResponse.js'
import { validate } from '../middleware/validate.js'
import { loginSchema } from '../modules/admin/admin.types.js'
import { blogPostSchema } from '../modules/blog/blog.types.js'
import { heroSchema } from '../modules/hero/hero.types.js'
import { projectSchema } from '../modules/project/project.types.js'

const router = Router()

// Public Admin Routes
router.post('/login', validate(loginSchema), authController.login)

// Protected Admin Routes
router.use(requireAdmin)

// Blog
router.post('/blogs', validate(blogPostSchema), blogController.createPost)
router.patch('/blogs/:id', blogController.updatePost)
router.delete('/blogs/:id', blogController.deletePost)
router.put('/blogs', blogController.bulkSyncPosts)
router.put('/blogs/sync', blogController.bulkSyncPosts)

// Posts Aggregate (Alias used by dashboard)
router.put('/posts', cmsController.syncAdminPosts)

// Projects
router.post('/projects', validate(projectSchema), projectController.createProject)
router.patch('/projects/:id', projectController.updateProject)
router.delete('/projects/:id', projectController.deleteProject)
router.put('/projects/sync', projectController.bulkSyncProjects)
router.put('/projects', projectController.bulkSyncProjects)

// Hero
router.patch('/hero', validate(heroSchema), heroController.updateHero)
router.put('/hero', validate(heroSchema), heroController.updateHero)

// Tools
router.delete('/tools/category/:id', toolsController.deleteCategory)
router.delete('/tools/:id', toolsController.deleteTool)
router.put('/tools/sync', toolsController.bulkSyncCategories)
router.put('/tools', toolsController.bulkSyncCategories)

// Experience
router.delete('/experience/:id', experienceController.deleteExperience)
router.delete('/education/:id', experienceController.deleteEducation)
router.put('/experience/sync', experienceController.bulkSyncExperience)
router.put('/experience', experienceController.bulkSyncExperience)
router.put('/career', experienceController.bulkSyncExperience)

// Process
router.delete('/process/:id', processController.deleteStep)
router.put('/process/sync', processController.bulkSyncSteps)
router.put('/process', processController.bulkSyncSteps)

// Bento
router.patch('/bento', bentoController.updateBento)
router.put('/bento', bentoController.updateBento)

// Credentials
router.get('/credentials', credentialsController.getCredentials)
router.put('/credentials', credentialsController.bulkSyncCredentials)
router.delete('/credentials/:id', credentialsController.deleteCredential)

// Messages
router.get('/messages', messagesController.getMessages)
router.patch('/messages/:id/read', messagesController.markAsRead)
router.delete('/messages/:id', messagesController.deleteMessage)

export default router
