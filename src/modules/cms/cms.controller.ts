import { Request, Response } from 'express'
import { cmsService } from './cms.service.js'
import { sendResponse, sendError } from '../../utils/apiResponse.js'

export class CmsController {
    static async getHomepage(req: Request, res: Response) {
        try {
            const data = await cmsService.getHomepageData()
            return sendResponse(res, data)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }

    static async getAdminPosts(req: Request, res: Response) {
        try {
            const data = await cmsService.getAdminPosts()
            return sendResponse(res, data)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }

    static async syncAdminPosts(req: Request, res: Response) {
        try {
            const { blog, projects } = req.body
            const data = await cmsService.syncAdminPosts(blog, projects)
            return sendResponse(res, data, 'Posts synchronized successfully')
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }
}

export const cmsController = CmsController
