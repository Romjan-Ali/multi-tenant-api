import { z } from 'zod'
import { emailSchema, passwordSchema } from './common.validation'

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),
})

export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: z.string().min(2, 'Name must be at least 2 characters'),
    organizationName: z
      .string()
      .min(2, 'Organization name must be at least 2 characters'),
  }),
})

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  }),
})

export type LoginInput = z.infer<typeof loginSchema>['body']
export type RegisterInput = z.infer<typeof registerSchema>['body']
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body']
