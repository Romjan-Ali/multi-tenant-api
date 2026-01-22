import { Router } from 'express'
import { UserController } from '../controllers/user.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validation'
import {
  createUserSchema,
  updateUserSchema,
} from '../validations/user.validation'

const router = Router()
const userController = new UserController()

router.use(authenticate)

router.post('/', validate(createUserSchema), userController.createUser)

router.get('/', userController.getUsers)

router.get('/:id', userController.getUser)

router.patch('/:id', validate(updateUserSchema), userController.updateUser)

router.delete('/:id', userController.deleteUser)

export default router
