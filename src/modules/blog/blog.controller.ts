import { Request, Response } from 'express'
import { blogService } from './blog.service.js'
import { sendResponse, sendError } from '../../utils/apiResponse.js'

export const blogController = {
    async getPosts(req: Request, res: Response) {
        try {
            const posts = await blogService.getAll()
            return sendResponse(res, posts)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async getPostBySlug(req: Request, res: Response) {
        try {
            const post = await blogService.getBySlug(req.params.slug as string)
            if (!post) return sendError(res, 'Post not found', 404)
            return sendResponse(res, post)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async createPost(req: Request, res: Response) {
        try {
            const post = await blogService.create(req.body)
            return sendResponse(res, post, 'Post created successfully', true, 201)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async updatePost(req: Request, res: Response) {
        try {
            const post = await blogService.update(req.params.id as string, req.body)
            return sendResponse(res, post, 'Post updated successfully')
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async deletePost(req: Request, res: Response) {
        try {
            await blogService.delete(req.params.id as string)
            return sendResponse(res, null, 'Post deleted successfully', true, 204)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async bulkSyncPosts(req: Request, res: Response) {
        try {
            if (!Array.isArray(req.body)) {
                return sendError(res, 'Expected an array of posts', 400)
            }
            const posts = await blogService.bulkSync(req.body)
            return sendResponse(res, posts, 'Blog posts synchronized successfully')
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }
}
