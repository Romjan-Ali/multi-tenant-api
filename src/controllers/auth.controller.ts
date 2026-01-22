import type { Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/auth.service'
import { AppError } from '../middleware/errorHandler'

const authService = new AuthService()

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body)
      res.status(200).json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body)
      res.status(201).json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      next(error)
    }
  }

  async getCurrentUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const user = await authService.getCurrentUser(req.user.id)
      res.status(200).json({
        status: 'success',
        data: user,
      })
    } catch (error) {
      next(error)
    }
  }
}
