import { Request, Response } from 'express'
import { messagesService } from './messages.service.js'
import { sendResponse, sendError } from '../../utils/apiResponse.js'

export const messagesController = {
    async getMessages(req: Request, res: Response) {
        try {
            const messages = await messagesService.getAll()
            return sendResponse(res, messages)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async createMessage(req: Request, res: Response) {
        try {
            const { name, email, subject, message } = req.body
            if (!name || !email || !message) {
                return sendError(res, 'Name, email and message are required', 400)
            }
            const newMessage = await messagesService.create({ name, email, subject: subject || 'No Subject', message })
            return sendResponse(res, newMessage, 'Message sent successfully', true, 201)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async markAsRead(req: Request, res: Response) {
        try {
            const message = await messagesService.markAsRead(req.params.id as string)
            return sendResponse(res, message, 'Message marked as read')
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async deleteMessage(req: Request, res: Response) {
        try {
            await messagesService.delete(req.params.id as string)
            return sendResponse(res, null, 'Message deleted successfully', true, 204)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }
}
