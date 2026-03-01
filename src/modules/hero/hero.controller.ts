import { Request, Response } from 'express'
import { heroService } from './hero.service.js'
import { sendResponse, sendError } from '../../utils/apiResponse.js'

export const heroController = {
    async getHero(req: Request, res: Response) {
        try {
            const hero = await heroService.get()
            return sendResponse(res, hero)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async updateHero(req: Request, res: Response) {
        try {
            const hero = await heroService.update(req.body)
            return sendResponse(res, hero, 'Hero updated successfully')
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }
}
