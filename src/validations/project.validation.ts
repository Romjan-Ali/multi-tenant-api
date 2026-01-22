import { z } from 'zod'
import { idSchema } from './common.validation'

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Project name must be at least 2 characters'),
    description: z.string().optional(),
    organizationId: idSchema.optional(), // inferred from user if not provided
  }),
})

export const updateProjectSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, 'Project name must be at least 2 characters')
        .optional(),
      description: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>['body']

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>['body']
