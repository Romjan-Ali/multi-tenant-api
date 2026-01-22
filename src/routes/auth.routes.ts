import { Router } from 'express'
import { AuthController } from '../controllers/auth.controller'
import { validate } from '../middleware/validation'
import { loginSchema, registerSchema } from '../validations/auth.validation'

const router = Router()
const authController = new AuthController()

router.post('/login', validate(loginSchema), authController.login)
router.post('/register', validate(registerSchema), authController.register)

export default router
