import type { Request, Response, NextFunction } from 'express'
import { ProjectService } from '../services/project.service'
import { AppError } from '../middleware/errorHandler'

const projectService = new ProjectService()

export class ProjectController {
  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      // Only organization admin and member can create projects
      if (req.user.role === 'PLATFORM_ADMIN') {
        throw new AppError(
          403,
          'Platform admin cannot create projects directly',
        )
      }

      const project = await projectService.createProject(
        req.body,
        req.user.id,
        req.user.organizationId,
      )
      res.status(201).json({
        status: 'success',
        data: project,
      })
    } catch (error) {
      next(error)
    }
  }

  async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const projects = await projectService.getProjects(
        req.user.id,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: projects,
      })
    } catch (error) {
      next(error)
    }
  }

  async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      if (!req.params.id) {
        throw new AppError(400, 'Organization ID is required')
      }

      const project = await projectService.getProject(
        req.params.id as string,
        req.user.id,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: project,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      if (!req.params.id) {
        throw new AppError(400, 'Organization ID is required')
      }

      const project = await projectService.updateProject(
        req.params.id as string,
        req.body,
        req.user.id,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: project,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      if (!req.params.id) {
        throw new AppError(400, 'Organization ID is required')
      }

      const result = await projectService.deleteProject(
        req.params.id as string,
        req.user.id,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }
}
