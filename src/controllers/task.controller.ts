import type { Request, Response, NextFunction } from 'express'
import { TaskService } from '../services/task.service'
import { AppError } from '../middleware/errorHandler'

const taskService = new TaskService()

export class TaskController {
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      // Only organization admin and member can create tasks
      if (req.user.role === 'PLATFORM_ADMIN') {
        throw new AppError(403, 'Platform admin cannot create tasks directly')
      }

      const task = await taskService.createTask(
        req.body,
        req.user.id,
        req.user.organizationId,
      )
      res.status(201).json({
        status: 'success',
        data: task,
      })
    } catch (error) {
      next(error)
    }
  }

  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const tasks = await taskService.getTasks(
        req.user.id,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: tasks,
      })
    } catch (error) {
      next(error)
    }
  }

  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const task = await taskService.getTask(
        req.params.id,
        req.user.id,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: task,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const task = await taskService.updateTask(
        req.params.id,
        req.body,
        req.user.id,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: task,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const result = await taskService.deleteTask(
        req.params.id,
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

  async assignTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const { userId } = req.body

      const task = await taskService.assignTaskToUser(
        req.params.id,
        userId,
        req.user.id,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: task,
      })
    } catch (error) {
      next(error)
    }
  }

  async unassignTask(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const { userId } = req.body

      const task = await taskService.unassignTaskFromUser(
        req.params.id,
        userId,
        req.user.id,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: task,
      })
    } catch (error) {
      next(error)
    }
  }
}
