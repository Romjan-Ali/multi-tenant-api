import { z } from 'zod'

export const idSchema = z.cuid('Invalid ID format')
export const emailSchema = z.email('Invalid email address')
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
})
