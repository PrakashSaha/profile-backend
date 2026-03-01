import { Request, Response } from 'express'
import { toolsService } from './tools.service.js'
import { sendResponse, sendError } from '../../utils/apiResponse.js'

export const toolsController = {
    async getCategories(req: Request, res: Response) {
        try {
            const categories = await toolsService.getAll()
            return sendResponse(res, categories)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async bulkSyncCategories(req: Request, res: Response) {
        try {
            if (!Array.isArray(req.body)) {
                return sendError(res, 'Expected an array of categories', 400)
            }
            const categories = await toolsService.bulkSyncCategories(req.body)
            return sendResponse(res, categories, 'Tools synchronized successfully')
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async deleteCategory(req: Request, res: Response) {
        try {
            await toolsService.deleteCategory(req.params.id as string)
            return sendResponse(res, null, 'Category deleted successfully', true, 204)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async deleteTool(req: Request, res: Response) {
        try {
            await toolsService.deleteTool(req.params.id as string)
            return sendResponse(res, null, 'Tool deleted successfully', true, 204)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }
}
