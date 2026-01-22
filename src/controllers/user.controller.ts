import type { Request, Response, NextFunction } from 'express'
import { UserService } from '../services/user.service'
import { AppError } from '../middleware/errorHandler'

const userService = new UserService()

export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      // Only platform admin and organization admin can create users
      if (
        req.user.role !== 'PLATFORM_ADMIN' &&
        req.user.role !== 'ORGANIZATION_ADMIN'
      ) {
        throw new AppError(403, 'Insufficient permissions to create users')
      }

      const user = await userService.createUser(
        req.body,
        req.user.role,
        req.user.organizationId,
      )
      res.status(201).json({
        status: 'success',
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const users = await userService.getUsers(
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: users,
      })
    } catch (error) {
      next(error)
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const user = await userService.getUser(
        req.params.id,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      // Only platform admin and organization admin can update users
      if (
        req.user.role !== 'PLATFORM_ADMIN' &&
        req.user.role !== 'ORGANIZATION_ADMIN'
      ) {
        throw new AppError(403, 'Insufficient permissions to update users')
      }

      const user = await userService.updateUser(
        req.params.id,
        req.body,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      // Only platform admin and organization admin can delete users
      if (
        req.user.role !== 'PLATFORM_ADMIN' &&
        req.user.role !== 'ORGANIZATION_ADMIN'
      ) {
        throw new AppError(403, 'Insufficient permissions to delete users')
      }

      const result = await userService.deleteUser(
        req.params.id,
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
