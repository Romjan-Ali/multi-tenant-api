import { z } from 'zod'

export const createOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Organization name must be at least 2 characters'),
    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .regex(
        /^[a-z0-9-]+$/,
        'Slug can only contain lowercase letters, numbers, and hyphens',
      ),
  }),
})

export const updateOrganizationSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(2, 'Organization name must be at least 2 characters')
        .optional(),
      slug: z
        .string()
        .min(2, 'Slug must be at least 2 characters')
        .regex(
          /^[a-z0-9-]+$/,
          'Slug can only contain lowercase letters, numbers, and hyphens',
        )
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
})

export type CreateOrganizationInput = z.infer<
  typeof createOrganizationSchema
>['body']
export type UpdateOrganizationInput = z.infer<
  typeof updateOrganizationSchema
>['body']
