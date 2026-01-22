import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import organizationRoutes from './routes/organization.routes'
import userRoutes from './routes/user.routes'
import projectRoutes from './routes/project.routes'
import taskRoutes from './routes/task.routes'
import { authenticate } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import { AuthController } from './controllers/auth.controller'

// Load environment variables
dotenv.config()

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET']
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
)

if (missingEnvVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnvVars.join(', ')}`,
  )
  // In production/Vercel, we should still allow the app to start
  // but log the error so it's visible in logs
  if (process.env.NODE_ENV === 'development') {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`,
    )
  }
}

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors())
app.use(morgan('combined'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/organizations', organizationRoutes)
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

// Current user route (requires authentication)
const authController = new AuthController()
app.get('/api/me', authenticate, authController.getCurrentUser)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'multi-tenant-api',
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  })
})

// Error handler
app.use(errorHandler)

// Start server (only in development or non-serverless environments)
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📚 API Documentation available at http://localhost:${PORT}`)
  })
}

// Export for Vercel serverless functions
export default app
