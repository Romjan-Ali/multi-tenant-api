import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { Role } from '../generated/prisma/client'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email: string
    role: Role
    organizationId: string
  }
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'No authentication token provided',
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
      },
    })

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'User not found',
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token',
      })
    }
    next(error)
  }
}

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required',
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions',
      })
    }

    next()
  }
}

export const authorizeOrganizationAccess = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required',
    })
  }

  // Platform admin can access all organizations
  if (req.user.role === Role.PLATFORM_ADMIN) {
    return next()
  }

  // Check if user is trying to access their own organization
  const organizationId = req.params.organizationId || req.body.organizationId

  if (organizationId && organizationId !== req.user.organizationId) {
    return res.status(403).json({
      status: 'error',
      message: 'Access to this organization is forbidden',
    })
  }

  next()
}
