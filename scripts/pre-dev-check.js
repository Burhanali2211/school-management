#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Pre-development environment check...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('Creating .env.local with default PostgreSQL configuration...');
  
  const defaultEnv = `# Database Configuration
DATABASE_URL="postgresql://postgres:admin@localhost:5432/school_db"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# Security Configuration
JWT_SECRET="your-super-secure-jwt-secret-key-change-in-production-min-32-chars"
NEXTAUTH_SECRET="your-super-secure-nextauth-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Session Configuration
SESSION_DURATION="86400000"
MAX_LOGIN_ATTEMPTS="5"
LOCKOUT_DURATION="300000"
`;
  
  fs.writeFileSync(envPath, defaultEnv);
  console.log('✅ Created .env.local with default configuration');
  console.log('⚠️  Please update DATABASE_URL with your PostgreSQL credentials\n');
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local!');
  process.exit(1);
}

// Validate DATABASE_URL format
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://')) {
  console.error('❌ DATABASE_URL must be a PostgreSQL connection string!');
  console.error('Current URL:', dbUrl.substring(0, 20) + '...');
  console.error('Expected format: postgresql://username:password@localhost:5432/database_name');
  process.exit(1);
}

console.log('✅ Environment configuration validated');
console.log(`📊 Database: ${dbUrl.replace(/:[^:]*@/, ':****@')}\n`);

try {
  // Check if Prisma client is generated
  console.log('🔧 Checking Prisma client...');
  const prismaClientPath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
  if (!fs.existsSync(prismaClientPath)) {
    console.log('⚠️  Prisma client not found, generating...');
    execSync('npx prisma generate', { stdio: 'inherit' });
  }
  console.log('✅ Prisma client ready\n');

  // Test database connection
  console.log('📡 Testing database connection...');
  execSync('node scripts/check-database.js', { stdio: 'inherit' });

} catch (error) {
  console.error('\n❌ Pre-development check failed!');
  console.log('\n🔧 To fix this issue, run:');
  console.log('   npm run setup:db');
  console.log('\n   This will:');
  console.log('   • Generate Prisma client');
  console.log('   • Create database schema');
  console.log('   • Seed initial data');
  process.exit(1);
}

console.log('\n🎉 All checks passed! Starting development server...\n');