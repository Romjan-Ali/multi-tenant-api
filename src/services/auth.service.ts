import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import type { LoginInput, RegisterInput } from '../validations/auth.validation'
import { AppError } from '../middleware/errorHandler'
import { Role } from '../generated/prisma/browser'

const SALT_ROUNDS = 10

export class AuthService {
  async login(data: LoginInput) {
    const { email, password } = data

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError(401, 'Invalid email or password')
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organization: user.organization,
      },
      token,
    }
  }

  async register(data: RegisterInput) {
    const { email, password, name, organizationName } = data

    console.log('Registering user:', email, 'for organization:', organizationName)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      throw new AppError(409, 'User already exists')
    }

    // Create organization and user in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: organizationName.toLowerCase().replace(/\s+/g, '-'),
        },
      })

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

      // Create user as organization admin
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: Role.ORGANIZATION_ADMIN,
          organizationId: organization.id,
        },
        include: {
          organization: true,
        },
      })

      return { user, organization }
    })

    const token = jwt.sign(
      { userId: result.user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' },
    )

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        organizationId: result.user.organizationId,
        organization: result.organization,
      },
      token,
    }
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
      },
    })

    if (!user) {
      throw new AppError(404, 'User not found')
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
