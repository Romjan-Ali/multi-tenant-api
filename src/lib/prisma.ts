import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  const error = 'DATABASE_URL environment variable is not set'
  console.error(`⚠️  ${error}`)
  // In development, throw immediately
  if (process.env.NODE_ENV === 'development') {
    throw new Error(error)
  }
}

// Initialize Prisma client with adapter for PostgreSQL
let prisma: PrismaClient

try {
  if (connectionString) {
    const adapter = new PrismaPg({ connectionString })
    prisma = new PrismaClient({ adapter })
    // Log successful initialization
    console.log('✅ Prisma client initialized with PostgreSQL adapter')
  } else {
    // In production, we should have DATABASE_URL, but don't crash on init
    // The error will be caught when trying to use the client
    console.warn('⚠️  DATABASE_URL not set, Prisma client may fail at runtime')
    // Create a minimal client - this will fail on first query if DATABASE_URL is missing
    // but won't crash the serverless function on initialization
    const dummyAdapter = new PrismaPg({ connectionString: 'postgresql://dummy' })
    prisma = new PrismaClient({ adapter: dummyAdapter })
  }
} catch (error) {
  console.error('❌ Failed to initialize Prisma client:', error)
  // In serverless, we want to fail fast if initialization fails
  throw error
}

export { prisma }