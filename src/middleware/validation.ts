import type { Request, Response, NextFunction } from 'express'
import { ZodType, ZodError } from 'zod'

export const validate =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('Validating request:', req.body, req.query, req.params)
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        console.log('Validation Error:', error.issues)
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.issues ?? 'Invalid request data',
        })
      }

      next(error)
    }
  }
