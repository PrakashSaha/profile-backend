import { Request, Response } from 'express'
import { projectService } from './project.service.js'
import { sendResponse, sendError } from '../../utils/apiResponse.js'

export const projectController = {
    async getProjects(req: Request, res: Response) {
        try {
            const projects = await projectService.getAll()
            return sendResponse(res, projects)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async getProjectBySlug(req: Request, res: Response) {
        try {
            const project = await projectService.getBySlug(req.params.slug as string)
            if (!project) return sendError(res, 'Project not found', 404)
            return sendResponse(res, project)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async createProject(req: Request, res: Response) {
        try {
            const project = await projectService.create(req.body)
            return sendResponse(res, project, 'Project created successfully', true, 201)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async updateProject(req: Request, res: Response) {
        try {
            const project = await projectService.update(req.params.id as string, req.body)
            return sendResponse(res, project, 'Project updated successfully')
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async deleteProject(req: Request, res: Response) {
        try {
            await projectService.delete(req.params.id as string)
            return sendResponse(res, null, 'Project deleted successfully', true, 204)
        } catch (error: any) {
            return sendError(res, error.message)
        }
    },

    async bulkSyncProjects(req: Request, res: Response) {
        try {
            if (!Array.isArray(req.body)) {
                return sendError(res, 'Expected an array of projects', 400)
            }
            const projects = await projectService.bulkSync(req.body)
            return sendResponse(res, projects, 'Projects synchronized successfully')
        } catch (error: any) {
            return sendError(res, error.message)
        }
    }
}
