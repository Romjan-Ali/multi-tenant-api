# Multi-Tenant Organization Workspace API

A robust, production-ready REST API for managing multi-tenant organizations, projects, and tasks with strict isolation between organizations.

## 🚀 Features

- **Multi-Tenant Architecture**: Strict data isolation between organizations
- **Role-Based Access Control**: Platform Admin, Organization Admin, Organization Member
- **JWT Authentication**: Secure token-based authentication
- **TypeScript**: Full type safety throughout the application
- **PostgreSQL + Prisma**: Robust database with type-safe ORM
- **Zod Validation**: Request validation with detailed error messages
- **Docker Support**: Easy deployment with Docker Compose

## 🏗️ Architecture

```
src/
├── config/ # Configuration files
├── middleware/ # Express middleware (auth, validation, error handling)
├── controllers/ # Route controllers
├── services/ # Business logic layer
├── types/ # TypeScript type definitions
├── utils/ # Utility functions
├── validations/ # Zod validation schemas
├── prisma/ # Database schema
├── routes/ # Express route definitions
└── app.ts # Main application entry point
```


## 🛠️ Tech Stack

- **Runtime**: Bun + TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS
- **Logging**: Morgan
- **Containerization**: Docker

## 📦 Installation

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- [Docker](https://www.docker.com/) (optional)
- [PostgreSQL](https://www.postgresql.org/) (v15 or higher)

### Local Development

1. **Clone the repository**
	```bash
   git clone https://github.com/yourusername/multi-tenant-api.git
   cd multi-tenant-api
	```

2. **Install dependencies**
	```bash
  	bun install
  	```

3. **Set up environment variables**
	```bash
	cp .env.example .env
	# Edit .env with your configuration
	```
4. **Set up database**
	```bash
	# Generate Prisma client
	bunx prisma generate

	# Run migrations
	bunx prisma migrate dev --name init

	# Seed initial data (optional)
	bun run seed
	```
5. **Start the development server**
	```bash
	bun run dev
	```

### Docker Development
1. **Start services with Docker Compose**
	```bash
	docker-compose up
	```
2. **Run database migrations**
	```bash
	docker-compose exec app bunx prisma migrate dev
	```

### API Endpoints
#### Authentication

    POST /api/auth/login - User login

    POST /api/auth/register - User registration

    GET /api/me - Get current user profile

#### Organizations (Platform Admin only)

    POST /api/organizations - Create organization

    GET /api/organizations - List organizations

    GET /api/organizations/:id - Get organization details

    PATCH /api/organizations/:id - Update organization

    DELETE /api/organizations/:id - Delete organization

#### Users

    POST /api/users - Create user (Admin only)

    GET /api/users - List users

    GET /api/users/:id - Get user details

    PATCH /api/users/:id - Update user

    DELETE /api/users/:id - Delete user

#### Projects

    POST /api/projects - Create project

    GET /api/projects - List projects

    GET /api/projects/:id - Get project details

    PATCH /api/projects/:id - Update project

    DELETE /api/projects/:id - Delete project

#### Tasks

    POST /api/tasks - Create task

    GET /api/tasks - List tasks

    GET /api/tasks/:id - Get task details

    PATCH /api/tasks/:id - Update task

    DELETE /api/tasks/:id - Delete task

    POST /api/tasks/:id/assign - Assign task to user

    POST /api/tasks/:id/unassign - Unassign task from user

### Authorization Model
#### Roles

1. **Platform Admin**

	- Can create organizations

	- Can view all organizations

	- Can manage users across all organizations

2. **Organization Admin**

	- Belongs to one organization

	- Can manage users within their organization

	- Can manage projects & tasks within their organization

3. **Organization Member**

	- Belongs to one organization

	- Can access only assigned tasks

	- Can create projects and tasks

#### Data Isolation
- Users cannot access another organization's data
- Tasks cannot be assigned across organizations
- All authorization checks are enforced at the service layer

### Database Choice

PostgreSQL was chosen for this project because:

1. Relational Integrity: Multi-tenant architecture requires strong foreign key constraints and referential integrity

2. ACID Compliance: Ensures data consistency across complex transactions

3. Row-Level Security: Potential for implementing PostgreSQL RLS for additional security layer

4. Prisma Support: Excellent TypeScript integration and migration tooling

5. Performance: Optimized for complex queries with proper indexing

6. Scalability: Proven track record in production environments

### Testing
```bash
# Unit tests
bun test

# Integration tests
bun test:integration

# All tests
bun test:all
```

### Test Credentials

For testing the hosted API:

```txt
Platform Admin:
Email: admin@platform.com
Password: Admin123!

Organization Admin:
Email: orgadmin@example.com
Password: OrgAdmin123!

Organization Member:
Email: member@example.com
Password: Member123!
```


### ER Diagram

[https://docs/er-diagram.png](https://docs/er-diagram.png)

- The ER diagram shows the relationships between:

- Organization ↔ User (One-to-Many)

- Organization ↔ Project (One-to-Many)

- Organization ↔ Task (One-to-Many)

- Project ↔ Task (One-to-Many)

- User ↔ Task (Many-to-Many via assignees)


### Deployment

#### Railway Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link project
railway link

# Deploy
railway up
```

### Render Deployment

- Create a new Web Service on Render

- Connect your GitHub repository

- Add environment variables

- Deploy!

### API Documentation
#### Postman Collection

Import the Postman collection from postman/Multi-Tenant API.postman_collection.json

### OpenAPI/Swagger

Generate OpenAPI documentation:

```bash
bun run docs:generate
```

### Scripts

    bun run dev - Start development server

    bun run build - Build TypeScript

    bun run start - Start production server

    bun run migrate:dev - Run database migrations

    bun run generate - Generate Prisma client

    bun run studio - Open Prisma Studio

    bun run seed - Seed database with test data

    bun run test - Run tests

    bun run lint - Run ESLint

    bun run format - Format code with Prettier

### Contributing

    Fork the repository

    Create a feature branch

    Commit your changes

    Push to the branch

    Open a Pull Request

### License

MIT License - see LICENSE for details.


## 🧪 **Seed Script for Test Data**

Create `scripts/seed.ts`:
```typescript
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  // Create Platform Admin
  const platformAdminPassword = await bcrypt.hash('Admin123!', SALT_ROUNDS);
  const platformAdmin = await prisma.user.create({
    data: {
      email: 'admin@platform.com',
      password: platformAdminPassword,
      role: Role.PLATFORM_ADMIN,
      organizationId: 'platform', // Dummy organization ID for platform admin
    },
  });

  // Create Organization 1
  const org1 = await prisma.organization.create({
    data: {
      name: 'TechCorp Inc',
      slug: 'techcorp-inc',
    },
  });

  // Create Organization Admin for Org1
  const orgAdminPassword = await bcrypt.hash('OrgAdmin123!', SALT_ROUNDS);
  const orgAdmin1 = await prisma.user.create({
    data: {
      email: 'admin@techcorp.com',
      password: orgAdminPassword,
      role: Role.ORGANIZATION_ADMIN,
      organizationId: org1.id,
    },
  });

  // Create Members for Org1
  const member1Password = await bcrypt.hash('Member123!', SALT_ROUNDS);
  const member1 = await prisma.user.create({
    data: {
      email: 'john.doe@techcorp.com',
      password: member1Password,
      role: Role.ORGANIZATION_MEMBER,
      organizationId: org1.id,
    },
  });

  const member2Password = await bcrypt.hash('Member123!', SALT_ROUNDS);
  const member2 = await prisma.user.create({
    data: {
      email: 'jane.smith@techcorp.com',
      password: member2Password,
      role: Role.ORGANIZATION_MEMBER,
      organizationId: org1.id,
    },
  });

  // Create Projects for Org1
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      description: 'Complete redesign of company website',
      organizationId: org1.id,
      createdBy: orgAdmin1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      description: 'New mobile application for customer service',
      organizationId: org1.id,
      createdBy: member1.id,
    },
  });

  // Create Tasks for Project1
  await prisma.task.create({
    data: {
      title: 'Design Homepage',
      description: 'Create new homepage design mockups',
      projectId: project1.id,
      organizationId: org1.id,
      createdBy: orgAdmin1.id,
      status: 'in_progress',
      priority: 'high',
      assignees: {
        connect: [{ id: member1.id }],
      },
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  await prisma.task.create({
    data: {
      title: 'Implement Contact Form',
      description: 'Add new contact form with validation',
      projectId: project1.id,
      organizationId: org1.id,
      createdBy: orgAdmin1.id,
      status: 'pending',
      priority: 'medium',
      assignees: {
        connect: [{ id: member2.id }],
      },
    },
  });

  // Create Tasks for Project2
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
  });

  // Create Organization 2
  const org2 = await prisma.organization.create({
    data: {
      name: 'MarketingPro LLC',
      slug: 'marketingpro-llc',
    },
  });

  // Create users for Org2
  const orgAdmin2Password = await bcrypt.hash('OrgAdmin123!', SALT_ROUNDS);
  await prisma.user.create({
    data: {
      email: 'admin@marketingpro.com',
      password: orgAdmin2Password,
      role: Role.ORGANIZATION_ADMIN,
      organizationId: org2.id,
    },
  });

  const member3Password = await bcrypt.hash('Member123!', SALT_ROUNDS);
  await prisma.user.create({
    data: {
      email: 'alex.jones@marketingpro.com',
      password: member3Password,
      role: Role.ORGANIZATION_MEMBER,
      organizationId: org2.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('====================');
  console.log('Platform Admin:');
  console.log('Email: admin@platform.com');
  console.log('Password: Admin123!');
  console.log('\nOrganization 1 (TechCorp):');
  console.log('Admin: admin@techcorp.com / OrgAdmin123!');
  console.log('Member 1: john.doe@techcorp.com / Member123!');
  console.log('Member 2: jane.smith@techcorp.com / Member123!');
  console.log('\nOrganization 2 (MarketingPro):');
  console.log('Admin: admin@marketingpro.com / OrgAdmin123!');
  console.log('Member: alex.jones@marketingpro.com / Member123!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to package.json scripts:

```bash
{
  "scripts": {
    "seed": "bun run scripts/seed.ts"
  }
}
```

### Package.json

```json
{
  "name": "multi-tenant-api",
  "version": "1.0.0",
  "description": "Multi-Tenant Organization Workspace API",
  "main": "dist/app.js",
  "scripts": {
    "dev": "bun --watch src/app.ts",
    "build": "bun run generate && tsc",
    "start": "node dist/app.js",
    "generate": "prisma generate",
    "migrate:dev": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "studio": "prisma studio",
    "seed": "bun run scripts/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src/**/*.ts",
    "docker:build": "docker build -t multi-tenant-api .",
    "docker:run": "docker run -p 3000:3000 multi-tenant-api",
    "docker:compose": "docker-compose up"
  },
  "dependencies": {
    "@prisma/client": "^5.7.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "morgan": "^1.10.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.10.5",
    "prisma": "^5.7.0",
    "typescript": "^5.3.3",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "supertest": "^6.3.4",
    "ts-jest": "^29.1.1"
  },
  "engines": {
    "bun": ">=1.0.0"
  },
  "keywords": [
    "multi-tenant",
    "api",
    "typescript",
    "postgresql",
    "prisma",
    "express"
  ],
  "author": "Your Name",
  "license": "MIT"
}
```