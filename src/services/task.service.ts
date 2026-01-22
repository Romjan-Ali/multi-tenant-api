import { prisma } from '../lib/prisma'
import { Role } from '../generated/prisma/enums'

import type {
  CreateTaskInput,
  UpdateTaskInput,
} from '../validations/task.validation'
import { AppError } from '../middleware/errorHandler'

export class TaskService {
  async createTask(
    data: CreateTaskInput,
    userId: string,
    userOrganizationId: string,
  ) {
    const {
      title,
      description,
      projectId,
      assigneeIds,
      status,
      priority,
      dueDate,
    } = data

    // Check if project exists and belongs to user's organization
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: userOrganizationId,
      },
    })

    if (!project) {
      throw new AppError(404, 'Project not found or access denied')
    }

    // Verify assignees belong to the same organization
    if (assigneeIds && assigneeIds.length > 0) {
      const assignees = await prisma.user.findMany({
        where: {
          id: { in: assigneeIds },
          organizationId: userOrganizationId,
        },
      })

      if (assignees.length !== assigneeIds.length) {
        throw new AppError(
          400,
          'Some assignees do not belong to your organization',
        )
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        projectId,
        organizationId: userOrganizationId,
        createdBy: userId,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignees: assigneeIds
          ? {
              connect: assigneeIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        project: true,
        organization: true,
        assignees: {
          select: {
            id: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    return task
  }

  async getTasks(userId: string, userRole: Role, userOrganizationId: string) {
    let whereClause: any = {
      organizationId: userOrganizationId,
    }

    if (userRole === Role.ORGANIZATION_MEMBER) {
      // Members can only see tasks assigned to them
      whereClause.assignees = {
        some: {
          id: userId,
        },
      }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: true,
        organization: true,
        assignees: {
          select: {
            id: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return tasks
  }

  async getTask(
    id: string,
    userId: string,
    userRole: Role,
    userOrganizationId: string,
  ) {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        organization: true,
        assignees: {
          select: {
            id: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    if (!task) {
      throw new AppError(404, 'Task not found')
    }

    // Check if user has access to this task
    if (task.organizationId !== userOrganizationId) {
      throw new AppError(403, 'Access to this task is forbidden')
    }

    if (userRole === Role.ORGANIZATION_MEMBER) {
      // Members can only see tasks assigned to them
      const isAssigned = task.assignees.some(
        (assignee) => assignee.id === userId,
      )
      if (!isAssigned && task.createdBy !== userId) {
        throw new AppError(403, 'Access to this task is forbidden')
      }
    }

    return task
  }

  async updateTask(
    id: string,
    data: UpdateTaskInput,
    userId: string,
    userRole: Role,
    userOrganizationId: string,
  ) {
    // Check if task exists and user has access
    const task = await this.getTask(id, userId, userRole, userOrganizationId)

    // Check permissions for update
    if (userRole === Role.ORGANIZATION_MEMBER) {
      const canUpdate =
        task.createdBy === userId ||
        task.assignees.some((assignee) => assignee.id === userId)

      if (!canUpdate) {
        throw new AppError(
          403,
          'You do not have permission to update this task',
        )
      }
    }

    const updateData: any = { ...data }

    // Handle assignee updates
    if (data.assigneeIds) {
      updateData.assignees = {
        set: data.assigneeIds.map((id) => ({ id })),
      }
      delete updateData.assigneeIds
    }

    // Handle due date
    if (data.dueDate !== undefined) {
      updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        project: true,
        organization: true,
        assignees: {
          select: {
            id: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    return updatedTask
  }

  async deleteTask(
    id: string,
    userId: string,
    userRole: Role,
    userOrganizationId: string,
  ) {
    // Check if task exists and user has access
    const task = await this.getTask(id, userId, userRole, userOrganizationId)

    // Only organization admins and task creator can delete
    if (userRole === Role.ORGANIZATION_MEMBER && task.createdBy !== userId) {
      throw new AppError(
        403,
        'Only task creator or organization admin can delete task',
      )
    }

    await prisma.task.delete({
      where: { id },
    })

    return { message: 'Task deleted successfully' }
  }

  async assignTaskToUser(
    taskId: string,
    userId: string,
    assignerId: string,
    assignerRole: Role,
    assignerOrganizationId: string,
  ) {
    // Check if task exists and assigner has access
    const task = await this.getTask(
      taskId,
      assignerId,
      assignerRole,
      assignerOrganizationId,
    )

    // Check if user exists and belongs to the same organization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId: assignerOrganizationId,
      },
    })

    if (!user) {
      throw new AppError(
        404,
        'User not found or does not belong to your organization',
      )
    }

    // Check if user is already assigned
    const isAlreadyAssigned = task.assignees.some(
      (assignee) => assignee.id === userId,
    )
    if (isAlreadyAssigned) {
      throw new AppError(400, 'User is already assigned to this task')
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignees: {
          connect: { id: userId },
        },
      },
      include: {
        assignees: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    return updatedTask
  }

  async unassignTaskFromUser(
    taskId: string,
    userId: string,
    assignerId: string,
    assignerRole: Role,
    assignerOrganizationId: string,
  ) {
    // Check if task exists and assigner has access
    const task = await this.getTask(
      taskId,
      assignerId,
      assignerRole,
      assignerOrganizationId,
    )

    // Check if user is assigned
    const isAssigned = task.assignees.some((assignee) => assignee.id === userId)
    if (!isAssigned) {
      throw new AppError(400, 'User is not assigned to this task')
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        assignees: {
          disconnect: { id: userId },
        },
      },
      include: {
        assignees: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    })

    return updatedTask
  }
}
