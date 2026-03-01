import { Request, Response } from 'express'
import { credentialsService } from './credentials.service.js'
import { sendResponse, sendError } from '../../utils/apiResponse.js'

export const credentialsController = {
    async getCredentials(req: Request, res: Response) {
        try {
            const credentials = await credentialsService.getAll()
            return sendResponse(res, credentials)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async bulkSyncCredentials(req: Request, res: Response) {
        try {
            const credentials = await credentialsService.bulkSync(req.body)
            return sendResponse(res, credentials, 'Credentials synchronized successfully')
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async deleteCredential(req: Request, res: Response) {
        try {
            await credentialsService.delete(req.params.id as string)
            return sendResponse(res, null, 'Credential deleted successfully', true, 204)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }
}
