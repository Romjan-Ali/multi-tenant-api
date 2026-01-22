import { prisma } from '../lib/prisma'
import { Role } from '../generated/prisma/enums'
import bcrypt from 'bcryptjs'
import type {
  CreateUserInput,
  UpdateUserInput,
} from '../validations/user.validation'
import { AppError } from '../middleware/errorHandler'

const SALT_ROUNDS = 10

export class UserService {
  async createUser(
    data: CreateUserInput,
    creatorRole: Role,
    creatorOrganizationId?: string,
  ) {
    const { email, password, role, organizationId } = data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new AppError(409, 'User already exists')
    }

    // Determine target organization
    let targetOrganizationId = organizationId

    if (creatorRole === Role.ORGANIZATION_ADMIN) {
      // Org admin can only create users in their own organization
      if (organizationId && organizationId !== creatorOrganizationId) {
        throw new AppError(403, 'Cannot create user in another organization')
      }
      targetOrganizationId = creatorOrganizationId!
    } else if (creatorRole === Role.PLATFORM_ADMIN) {
      // Platform admin must specify organization for new users
      if (!organizationId) {
        throw new AppError(400, 'Organization ID is required')
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        organizationId: targetOrganizationId!,
      },
      include: {
        organization: true,
      },
    })

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  async getUsers(requesterRole: Role, requesterOrganizationId?: string) {
    if (requesterRole === Role.PLATFORM_ADMIN) {
      // Platform admin can see all users
      return await prisma.user.findMany({
        where: {
          role: {
            not: Role.PLATFORM_ADMIN, // Don't include other platform admins
          },
        },
        select: {
          id: true,
          email: true,
          role: true,
          organizationId: true,
          organization: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    } else {
      // Organization users can only see users in their own organization
      return await prisma.user.findMany({
        where: {
          organizationId: requesterOrganizationId,
          role: {
            not: Role.PLATFORM_ADMIN,
          },
        },
        select: {
          id: true,
          email: true,
          role: true,
          organizationId: true,
          organization: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    }
  }

  async getUser(
    id: string,
    requesterRole: Role,
    requesterOrganizationId?: string,
  ) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
        organization: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    // Check if requester has access to this user
    if (
      requesterRole !== Role.PLATFORM_ADMIN &&
      user.organizationId !== requesterOrganizationId
    ) {
      throw new AppError(403, 'Access to this user is forbidden')
    }

    return user
  }

  async updateUser(
    id: string,
    data: UpdateUserInput,
    requesterRole: Role,
    requesterOrganizationId?: string,
  ) {
    // Check if user exists and requester has access
    await this.getUser(id, requesterRole, requesterOrganizationId)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { ...data }

    // Hash password if provided
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, SALT_ROUNDS)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        role: true,
        organizationId: true,
        organization: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  }

  async deleteUser(
    id: string,
    requesterRole: Role,
    requesterOrganizationId?: string,
  ) {
    // Check if user exists and requester has access
    await this.getUser(id, requesterRole, requesterOrganizationId)

    // Prevent deletion of oneself
    // This would require the requester's user ID to be passed in

    await prisma.user.delete({
      where: { id },
    })

    return { message: 'User deleted successfully' }
  }
}
