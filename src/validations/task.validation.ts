import { z } from 'zod'
import { idSchema } from './common.validation'

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().optional(),
    projectId: idSchema,
    assigneeIds: z.array(idSchema).optional(),
    status: z
      .enum(['pending', 'in_progress', 'completed', 'blocked'])
      .default('pending'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    dueDate: z.string().datetime().optional(),
  }),
})

export const updateTaskSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .min(2, 'Title must be at least 2 characters')
        .optional(),
      description: z.string().optional(),
      status: z
        .enum(['pending', 'in_progress', 'completed', 'blocked'])
        .optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      assigneeIds: z.array(idSchema).optional(),
      dueDate: z.string().datetime().optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
})

export const assignTaskSchema = z.object({
  body: z.object({
    userId: idSchema,
  }),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>['body']

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>['body']

export type AssignTaskInput = z.infer<typeof assignTaskSchema>['body']
