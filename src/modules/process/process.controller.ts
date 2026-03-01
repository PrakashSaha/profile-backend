import { Request, Response } from 'express'
import { processService } from './process.service.js'
import { sendResponse, sendError } from '../../utils/apiResponse.js'

export const processController = {
    async getSteps(req: Request, res: Response) {
        try {
            const steps = await processService.getAll()
            return sendResponse(res, steps)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async bulkSyncSteps(req: Request, res: Response) {
        try {
            const steps = await processService.bulkSync(req.body)
            return sendResponse(res, steps, 'Engineering process synchronized successfully')
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async deleteStep(req: Request, res: Response) {
        try {
            await processService.delete(req.params.id as string)
            return sendResponse(res, null, 'Step deleted successfully', true, 204)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }
}
