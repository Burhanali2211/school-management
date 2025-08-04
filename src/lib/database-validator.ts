import { PrismaClient } from '@prisma/client';

class DatabaseValidator {
  private static instance: DatabaseValidator;
  private prisma: PrismaClient;
  private isValidated = false;
  private validationPromise: Promise<boolean> | null = null;

  private constructor() {
    this.prisma = new PrismaClient();
  }

  public static getInstance(): DatabaseValidator {
    if (!DatabaseValidator.instance) {
      DatabaseValidator.instance = new DatabaseValidator();
    }
    return DatabaseValidator.instance;
  }

  public async validateDatabase(): Promise<boolean> {
    // Return cached result if already validated
    if (this.isValidated) {
      return true;
    }

    // Return existing promise if validation is in progress
    if (this.validationPromise) {
      return this.validationPromise;
    }

    // Start new validation
    this.validationPromise = this.performValidation();
    return this.validationPromise;
  }

  private async performValidation(): Promise<boolean> {
    try {
      console.log('🔍 Validating database connection and schema...');

      // Step 1: Test basic connection
      await this.prisma.$connect();
      console.log('✅ Database connection successful');

      // Step 2: Validate environment configuration
      this.validateEnvironment();
      console.log('✅ Environment configuration valid');

      // Step 3: Check if essential tables exist
      await this.validateTables();
      console.log('✅ Database tables validated');

      // Step 4: Check if admin user exists
      await this.validateAdminUser();
      console.log('✅ Admin user validated');

      this.isValidated = true;
      console.log('🎉 Database validation completed successfully');
      return true;

    } catch (error) {
      console.error('❌ Database validation failed:', error);
      await this.handleValidationError(error);
      throw error;
    }
  }

  private validateEnvironment(): void {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Check if URL format matches the provider
    if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
      // PostgreSQL URL format is correct
      return;
    } else if (databaseUrl.startsWith('file:')) {
      throw new Error('SQLite database detected, but schema is configured for PostgreSQL. Please update your DATABASE_URL or schema.');
    } else {
      throw new Error(`Invalid DATABASE_URL format: ${databaseUrl.substring(0, 20)}...`);
    }
  }

  private async validateTables(): Promise<void> {
    try {
      // Check if essential tables exist by trying to count records
      await Promise.all([
        this.prisma.admin.count(),
        this.prisma.student.count(),
        this.prisma.teacher.count(),
        this.prisma.parent.count(),
        this.prisma.class.count(),
        this.prisma.subject.count(),
      ]);
    } catch (error: any) {
      if (error.code === 'P2021') {
        throw new Error('Database tables do not exist. Please run: npm run setup:db');
      }
      throw error;
    }
  }

  private async validateAdminUser(): Promise<void> {
    const adminCount = await this.prisma.admin.count();
    if (adminCount === 0) {
      throw new Error('No admin users found. Please run: npm run seed:complete');
    }
  }

  private async handleValidationError(error: any): Promise<void> {
    console.error('\n🔧 Database Validation Error Details:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);

    if (error.code === 'P1001') {
      console.error('\n💡 Connection Error Solutions:');
      console.error('1. Ensure PostgreSQL server is running');
      console.error('2. Check DATABASE_URL in .env.local');
      console.error('3. Verify database exists and credentials are correct');
      console.error('4. Run: npm run check:db');
    } else if (error.code === 'P2021') {
      console.error('\n💡 Schema Error Solutions:');
      console.error('1. Run: npm run setup:db');
      console.error('2. Or manually run: npx prisma db push');
    } else if (error.message.includes('SQLite')) {
      console.error('\n💡 Database Provider Mismatch:');
      console.error('1. Your DATABASE_URL is for SQLite but schema expects PostgreSQL');
      console.error('2. Update your .env.local with PostgreSQL URL');
      console.error('3. Or change prisma/schema.prisma provider to "sqlite"');
    }

    console.error('\n🚀 Quick Fix Command:');
    console.error('npm run setup:db');
  }

  public async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  public getPrismaClient(): PrismaClient {
    return this.prisma;
  }
}

// Export singleton instance
export const databaseValidator = DatabaseValidator.getInstance();

// Export validation function for middleware
export async function validateDatabaseConnection(): Promise<boolean> {
  return databaseValidator.validateDatabase();
}

// Export Prisma client getter
export function getPrismaClient(): PrismaClient {
  return databaseValidator.getPrismaClient();
}