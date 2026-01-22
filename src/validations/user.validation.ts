import { z } from 'zod'
import { Role } from '../generated/prisma/enums'
import { emailSchema, passwordSchema, idSchema } from './common.validation'

export const createUserSchema = z.object({
  body: z
    .object({
      email: emailSchema,
      password: passwordSchema,
      role: z.nativeEnum(Role, {
        message:
          'Invalid role. Must be ORGANIZATION_ADMIN or ORGANIZATION_MEMBER',
      }),
      organizationId: idSchema.optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === Role.ORGANIZATION_ADMIN && !data.organizationId) {
        ctx.addIssue({
          path: ['organizationId'],
          code: z.ZodIssueCode.custom,
          message: 'organizationId is required for organization admin',
        })
      }
    }),
})

export const updateUserSchema = z.object({
  body: z
    .object({
      email: emailSchema.optional(),
      password: passwordSchema.optional(),
      role: z
        .nativeEnum(Role, {
          message:
            'Invalid role. Must be ORGANIZATION_ADMIN or ORGANIZATION_MEMBER',
        })
        .optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
})

export const assignUserToOrganizationSchema = z.object({
  body: z.object({
    organizationId: idSchema,
  }),
})

export type CreateUserInput = z.infer<typeof createUserSchema>['body']

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body']

export type AssignUserToOrganizationInput = z.infer<
  typeof assignUserToOrganizationSchema
>['body']
