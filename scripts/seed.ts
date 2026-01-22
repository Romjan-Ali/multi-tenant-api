import { prisma } from '../src/lib/prisma'
import { Role } from '../src/generated/prisma/client'
import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

async function main() {
  console.log('🌱 Starting database seeding...')

  // Clear existing data (respect FK order)
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
  await prisma.organization.deleteMany()

  // -------------------------------------
  // PLATFORM ORGANIZATION
  // -------------------------------------
  const platformOrg = await prisma.organization.create({
    data: {
      name: 'Platform',
      slug: 'platform',
    },
  })

  // Platform Admin
  const platformAdminPassword = await bcrypt.hash('Admin123!', SALT_ROUNDS)
  await prisma.user.create({
    data: {
      email: 'admin@platform.com',
      password: platformAdminPassword,
      role: Role.PLATFORM_ADMIN,
      organizationId: platformOrg.id, // ✅ VALID FK
    },
  })

  // -------------------------------------
  // ORGANIZATION 1
  // -------------------------------------
  const org1 = await prisma.organization.create({
    data: {
      name: 'TechCorp Inc',
      slug: 'techcorp-inc',
    },
  })

  const orgAdminPassword = await bcrypt.hash('OrgAdmin123!', SALT_ROUNDS)
  const orgAdmin1 = await prisma.user.create({
    data: {
      email: 'admin@techcorp.com',
      password: orgAdminPassword,
      role: Role.ORGANIZATION_ADMIN,
      organizationId: org1.id,
    },
  })

  const member1 = await prisma.user.create({
    data: {
      email: 'john.doe@techcorp.com',
      password: await bcrypt.hash('Member123!', SALT_ROUNDS),
      role: Role.ORGANIZATION_MEMBER,
      organizationId: org1.id,
    },
  })

  const member2 = await prisma.user.create({
    data: {
      email: 'jane.smith@techcorp.com',
      password: await bcrypt.hash('Member123!', SALT_ROUNDS),
      role: Role.ORGANIZATION_MEMBER,
      organizationId: org1.id,
    },
  })

  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of company website',
      organizationId: org1.id,
      createdBy: orgAdmin1.id,
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'New mobile application for customer service',
      organizationId: org1.id,
      createdBy: member1.id,
    },
  })

  await prisma.task.create({
    data: {
      title: 'Design Homepage',
      description: 'Create new homepage design mockups',
      projectId: project1.id,
      organizationId: org1.id,
      createdBy: orgAdmin1.id,
      status: 'in_progress',
      priority: 'high',
      assignees: { connect: [{ id: member1.id }] },
    },
  })

  await prisma.task.create({
    data: {
      title: 'Setup React Native',
      description: 'Initialize React Native project structure',
      projectId: project2.id,
      organizationId: org1.id,
      createdBy: member1.id,
      status: 'completed',
      priority: 'low',
      assignees: {
        connect: [{ id: member1.id }, { id: member2.id }],
      },
    },
  })

  // -------------------------------------
  // ORGANIZATION 2
  // -------------------------------------
  const org2 = await prisma.organization.create({
    data: {
      name: 'MarketingPro LLC',
      slug: 'marketingpro-llc',
    },
  })

  await prisma.user.create({
    data: {
      email: 'admin@marketingpro.com',
      password: await bcrypt.hash('OrgAdmin123!', SALT_ROUNDS),
      role: Role.ORGANIZATION_ADMIN,
      organizationId: org2.id,
    },
  })

  await prisma.user.create({
    data: {
      email: 'alex.jones@marketingpro.com',
      password: await bcrypt.hash('Member123!', SALT_ROUNDS),
      role: Role.ORGANIZATION_MEMBER,
      organizationId: org2.id,
    },
  })

  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
