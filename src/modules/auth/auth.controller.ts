import { Request, Response } from 'express'
import { authService } from './auth.service.js'
import { sendResponse, sendError } from '../../utils/apiResponse.js'

export const authController = {
    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body
            if (!email || !password) {
                return sendError(res, 'Email and password are required', 400)
            }
            const data = await authService.login(email, password)
            return sendResponse(res, data, 'Login successful')
        } catch (error: any) {
            return sendError(res, error.message, 401)
        }
    },

    async register(req: Request, res: Response) {
        try {
            // In a production environment, registration might be restricted or use a separate admin role.
            const user = await authService.register(req.body)
            return sendResponse(res, user, 'User registered successfully', true, 201)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }
}
