import { blogService } from '../blog/blog.service.js'
import { projectService } from '../project/project.service.js'
import { heroService } from '../hero/hero.service.js'
import { toolsService } from '../tools/tools.service.js'
import { experienceService } from '../experience/experience.service.js'
import { processService } from '../process/process.service.js'
import { bentoService } from '../bento/bento.service.js'
import { credentialsService } from '../credentials/credentials.service.js'

export class CmsService {
    static async getHomepageData() {
        const [hero, bento, tools, career, credentials, projects, blog, process] = await Promise.all([
            heroService.get(),
            bentoService.get(),
            toolsService.getAll(),
            experienceService.getAll(),
            credentialsService.getAll(),
            projectService.getHome(),
            blogService.getHome(),
            processService.getAll(),
        ])
        return { hero, bento, tools, career, credentials, projects, blog, process }
    }

    static async getAdminPosts() {
        const [blog, projects] = await Promise.all([
            blogService.getAll(),
            projectService.getAll(),
        ])
        return { blog, projects }
    }

    static async syncAdminPosts(blog: any, projects: any) {
        const results: any = {}
        if (blog) results.blog = await blogService.bulkSync(blog)
        if (projects) results.projects = await projectService.bulkSync(projects)
        return results
    }
}

export const cmsService = CmsService
