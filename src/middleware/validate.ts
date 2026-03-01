import { Request, Response, NextFunction } from 'express'
import { ZodObject, ZodError } from 'zod'
import { sendError } from '../utils/apiResponse.js'

export const validate = (schema: ZodObject<any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        })
        return next()
    } catch (error) {
        if (error instanceof ZodError) {
            const errorMessages = error.issues.map((issue: any) => `${issue.path.join('.')} - ${issue.message}`)
            return sendError(res, errorMessages.join(', '), 400)
        }
        return sendError(res, 'Internal server error', 500)
    }
}
