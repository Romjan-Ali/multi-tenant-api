import { Router } from 'express'
import { OrganizationController } from '../controllers/organization.controller'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validation'
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from '../validations/organization.validation'

const router = Router()
const organizationController = new OrganizationController()

router.use(authenticate)

router.post(
  '/',
  validate(createOrganizationSchema),
  organizationController.createOrganization,
)

router.get('/', organizationController.getOrganizations)

router.get('/:id', organizationController.getOrganization)

router.patch(
  '/:id',
  validate(updateOrganizationSchema),
  organizationController.updateOrganization,
)

router.delete('/:id', organizationController.deleteOrganization)

export default router
