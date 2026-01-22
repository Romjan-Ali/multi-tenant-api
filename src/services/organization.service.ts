import { prisma } from '../lib/prisma'
import { Role } from '../generated/prisma/enums'
import type {
  CreateOrganizationInput,
  UpdateOrganizationInput,
} from '../validations/organization.validation'
import { AppError } from '../middleware/errorHandler'

export class OrganizationService {
  async createOrganization(data: CreateOrganizationInput) {
    const { name, slug } = data

    // Check if organization already exists
    const existingOrg = await prisma.organization.findFirst({
      where: {
        OR: [{ name }, { slug }],
      },
    })

    if (existingOrg) {
      throw new AppError(409, 'Organization already exists')
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
      },
    })

    return organization
  }

  async getOrganization(
    id: string,
    userRole: Role,
    userOrganizationId?: string,
  ) {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    })

    if (!organization) {
      throw new AppError(404, 'Organization not found')
    }

    // Check if user has access to this organization
    if (
      userRole !== Role.PLATFORM_ADMIN &&
      organization.id !== userOrganizationId
    ) {
      throw new AppError(403, 'Access to this organization is forbidden')
    }

    return organization
  }

  async getOrganizations(userRole: Role, userOrganizationId?: string) {
    if (userRole === Role.PLATFORM_ADMIN) {
      // Platform admin can see all organizations
      return await prisma.organization.findMany({
        include: {
          _count: {
            select: {
              users: true,
              projects: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      })
    } else {
      // Organization users can only see their own organization
      return await prisma.organization.findMany({
        where: { id: userOrganizationId },
        include: {
          _count: {
            select: {
              users: true,
              projects: true,
            },
          },
        },
      })
    }
  }

  async updateOrganization(
    id: string,
    data: UpdateOrganizationInput,
    userRole: Role,
    userOrganizationId?: string,
  ) {
    // Check if organization exists and user has access
    await this.getOrganization(id, userRole, userOrganizationId)

    const organization = await prisma.organization.update({
      where: { id },
      data,
    })

    return organization
  }

  async deleteOrganization(
    id: string,
    userRole: Role,
    userOrganizationId?: string,
  ) {
    // Check if organization exists and user has access
    await this.getOrganization(id, userRole, userOrganizationId)

    await prisma.organization.delete({
      where: { id },
    })

    return { message: 'Organization deleted successfully' }
  }
}
