# Multi-Tenant Organization Workspace API

A robust, production-ready REST API for managing multi-tenant organizations, projects, and tasks with strict isolation between organizations.

## Features

- **Multi-Tenant Architecture**: Strict data isolation between organizations
- **Role-Based Access Control**: Platform Admin, Organization Admin, Organization Member
- **JWT Authentication**: Secure token-based authentication
- **TypeScript**: Full type safety throughout the application
- **PostgreSQL + Prisma**: Robust database with type-safe ORM
- **Zod Validation**: Request validation with detailed error messages
- **Docker Support**: Easy deployment with Docker Compose

## Architecture

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

## Installation

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

### Test Credentials

For testing the hosted API:

```txt
Platform Admin:
Email: admin@platform.com
Password: Admin123!

Organization Admin:
Email: sajib@example.com
Password: SRCB.49@3
.
Email: orgadmin@example.com
Password: OrgAdmin123!

Organization Member:
Email: member@example.com
Password: Member123!
```

### ER Diagram

[multi-tenant-erd.pdf](./multi-tenant-erd.pdf)

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

### Scripts

    bun run dev - Start development server

    bun run build - Build TypeScript

    bun run start - Start production server

    bun run migrate:dev - Run database migrations

    bun run generate - Generate Prisma client

    bun run studio - Open Prisma Studio

    bun run seed - Seed database with test data

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


## **Seed Script for Test Data**

Run this command:

```bash
bun run srcripts/seed.ts
```