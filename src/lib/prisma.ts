import { PrismaClient } from '@prisma/client'
import { databaseValidator } from './database-validator'

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  // Add middleware to validate database on first use
  client.$use(async (params, next) => {
    try {
      // Validate database connection before any operation
      await databaseValidator.validateDatabase()
      return next(params)
    } catch (error) {
      console.error('❌ Database validation failed before operation:', error)
      throw new Error(`Database not properly configured: ${error.message}`)
    }
  })

  return client
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
  await databaseValidator.disconnect()
})