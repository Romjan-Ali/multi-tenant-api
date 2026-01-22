import { Router } from 'express'
import { TaskController } from '../controllers/task.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validation'
import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
} from '../validations/task.validation'

const router = Router()
const taskController = new TaskController()

router.use(authenticate)

router.post('/', validate(createTaskSchema), taskController.createTask)

router.get('/', taskController.getTasks)

router.get('/:id', taskController.getTask)

router.patch('/:id', validate(updateTaskSchema), taskController.updateTask)

router.delete('/:id', taskController.deleteTask)

router.post(
  '/:id/assign',
  validate(assignTaskSchema),
  taskController.assignTask,
)

router.post(
  '/:id/unassign',
  validate(assignTaskSchema),
  taskController.unassignTask,
)

export default router
