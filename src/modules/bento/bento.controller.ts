import { Request, Response } from 'express'
import { bentoService } from './bento.service.js'
import { sendResponse, sendError } from '../../utils/apiResponse.js'

export const bentoController = {
    async getBento(req: Request, res: Response) {
        try {
            const bento = await bentoService.get()
            return sendResponse(res, bento?.content || null)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async updateBento(req: Request, res: Response) {
        try {
            const bento = await bentoService.update(req.body)
            return sendResponse(res, bento, 'Bento layout updated successfully')
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }
}
