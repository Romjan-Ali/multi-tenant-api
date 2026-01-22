import { prisma } from '../lib/prisma'
import { Role } from '../generated/prisma/enums'
import type {
  CreateProjectInput,
  UpdateProjectInput,
} from '../validations/project.validation'
import { AppError } from '../middleware/errorHandler'

export class ProjectService {
  async createProject(
    data: CreateProjectInput,
    userId: string,
    userOrganizationId: string,
  ) {
    const { name, description, organizationId } = data

    const targetOrganizationId = organizationId || userOrganizationId

    // Verify the user belongs to the target organization
    if (targetOrganizationId !== userOrganizationId) {
      throw new AppError(403, 'Cannot create project in another organization')
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        organizationId: targetOrganizationId,
        createdBy: userId,
      },
      include: {
        organization: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        tasks: true,
      },
    })

    return project
  }

  async getProjects(
    userId: string,
    userRole: Role,
    userOrganizationId: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let whereClause: any = {}

    if (userRole === Role.ORGANIZATION_MEMBER) {
      // Members can only see projects they're associated with (via tasks)
      whereClause = {
        OR: [
          { createdBy: userId },
          {
            tasks: {
              some: {
                assignees: {
                  some: {
                    id: userId,
                  },
                },
              },
            },
          },
        ],
        organizationId: userOrganizationId,
      }
    } else {
      // Admins can see all projects in their organization
      whereClause = {
        organizationId: userOrganizationId,
      }
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        organization: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        tasks: {
          include: {
            assignees: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return projects
  }

  async getProject(
    id: string,
    userId: string,
    userRole: Role,
    userOrganizationId: string,
  ) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        organization: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        tasks: {
          include: {
            assignees: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!project) {
      throw new AppError(404, 'Project not found')
    }

    // Check if user has access to this project
    if (project.organizationId !== userOrganizationId) {
      throw new AppError(403, 'Access to this project is forbidden')
    }

    if (userRole === Role.ORGANIZATION_MEMBER) {
      // Members can only see projects they're associated with
      const isAssociated =
        project.createdBy === userId ||
        project.tasks.some((task) =>
          task.assignees.some((assignee) => assignee.id === userId),
        )

      if (!isAssociated) {
        throw new AppError(403, 'Access to this project is forbidden')
      }
    }

    return project
  }

  async updateProject(
    id: string,
    data: UpdateProjectInput,
    userId: string,
    userRole: Role,
    userOrganizationId: string,
  ) {
    // Check if project exists and user has access
    const project = await this.getProject(
      id,
      userId,
      userRole,
      userOrganizationId,
    )

    // Only organization admins and project creator can update
    if (userRole === Role.ORGANIZATION_MEMBER && project.createdBy !== userId) {
      throw new AppError(
        403,
        'Only project creator or organization admin can update project',
      )
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data,
      include: {
        organization: true,
        user: {
          select: {
            id: true,
            email: true,
          },
        },
        tasks: {
          include: {
            assignees: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    })

    return updatedProject
  }

  async deleteProject(
    id: string,
    userId: string,
    userRole: Role,
    userOrganizationId: string,
  ) {
    // Check if project exists and user has access
    const project = await this.getProject(
      id,
      userId,
      userRole,
      userOrganizationId,
    )

    // Only organization admins and project creator can delete
    if (userRole === Role.ORGANIZATION_MEMBER && project.createdBy !== userId) {
      throw new AppError(
        403,
        'Only project creator or organization admin can delete project',
      )
    }

    await prisma.project.delete({
      where: { id },
    })

    return { message: 'Project deleted successfully' }
  }
}
