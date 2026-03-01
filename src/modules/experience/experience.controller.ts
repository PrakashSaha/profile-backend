import { Request, Response } from 'express'
import { experienceService } from './experience.service.js'
import { sendResponse, sendError } from '../../utils/apiResponse.js'

export const experienceController = {
    async getExperience(req: Request, res: Response) {
        try {
            const data = await experienceService.getAll()
            return sendResponse(res, data)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async bulkSyncExperience(req: Request, res: Response) {
        try {
            const { experiences, education } = req.body
            const data = await experienceService.bulkSyncExperience(experiences, education)
            return sendResponse(res, data, 'Experience and Education synchronized successfully')
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async deleteExperience(req: Request, res: Response) {
        try {
            await experienceService.deleteExperience(req.params.id as string)
            return sendResponse(res, null, 'Experience deleted successfully', true, 204)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async deleteEducation(req: Request, res: Response) {
        try {
            await experienceService.deleteEducation(req.params.id as string)
            return sendResponse(res, null, 'Education deleted successfully', true, 204)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }
}
