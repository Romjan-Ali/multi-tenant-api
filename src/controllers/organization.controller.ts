import type { Request, Response, NextFunction } from 'express'
import { OrganizationService } from '../services/organization.service'
import { AppError } from '../middleware/errorHandler'

const organizationService = new OrganizationService()

export class OrganizationController {
  async createOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      // Only platform admin can create organizations
      if (req.user.role !== 'PLATFORM_ADMIN') {
        throw new AppError(403, 'Only platform admin can create organizations')
      }

      const organization = await organizationService.createOrganization(
        req.body,
      )
      res.status(201).json({
        status: 'success',
        data: organization,
      })
    } catch (error) {
      next(error)
    }
  }

  async getOrganizations(req: Request, res: Response, next: NextFunction) {
    console.log('Fetching organizations')
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const organizations = await organizationService.getOrganizations(
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: organizations,
      })
    } catch (error) {
      next(error)
    }
  }

  async getOrganization(req: Request, res: Response, next: NextFunction) {
    console.log('Fetching organization with ID:', req.params.id)
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const organization = await organizationService.getOrganization(
        req.params.id,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: organization,
      })
    } catch (error) {
      next(error)
    }
  }

  async updateOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      const organization = await organizationService.updateOrganization(
        req.params.id,
        req.body,
        req.user.role,
        req.user.organizationId,
      )
      res.status(200).json({
        status: 'success',
        data: organization,
      })
    } catch (error) {
      next(error)
    }
  }

  async deleteOrganization(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Authentication required')
      }

      // Only platform admin can delete organizations
      if (req.user.role !== 'PLATFORM_ADMIN') {
        throw new AppError(403, 'Only platform admin can delete organizations')
      }

      const result = await organizationService.deleteOrganization(
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
