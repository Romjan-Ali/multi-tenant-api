import { Router } from 'express'
import { ProjectController } from '../controllers/project.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validation'
import {
  createProjectSchema,
  updateProjectSchema,
} from '../validations/project.validation'

const router = Router()
const projectController = new ProjectController()

router.use(authenticate)

router.post('/', validate(createProjectSchema), projectController.createProject)

router.get('/', projectController.getProjects)

router.get('/:id', projectController.getProject)

router.patch(
  '/:id',
  validate(updateProjectSchema),
  projectController.updateProject,
)

router.delete('/:id', projectController.deleteProject)

export default router
