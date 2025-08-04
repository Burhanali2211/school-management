#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up database for School Management System...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('Please create .env.local file with DATABASE_URL');
  process.exit(1);
}

// Read environment variables
require('dotenv').config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local!');
  process.exit(1);
}

console.log('✅ Environment configuration found');
console.log(`📊 Database URL: ${process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')}\n`);

try {
  // Step 1: Generate Prisma Client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  // Step 2: Push database schema
  console.log('📋 Pushing database schema...');
  execSync('npx prisma db push --force-reset', { stdio: 'inherit' });
  console.log('✅ Database schema pushed\n');

  // Step 3: Seed the database
  console.log('🌱 Seeding database...');
  execSync('npm run seed:complete', { stdio: 'inherit' });
  console.log('✅ Database seeded successfully\n');

  console.log('🎉 Database setup completed successfully!');
  console.log('\n📝 You can now:');
  console.log('   • Run: npm run dev');
  console.log('   • Login with: admin1 / admin123');
  console.log('   • Or any teacher1 / teacher1123, student1 / student1123, parent1 / parent1123');

} catch (error) {
  console.error('❌ Database setup failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Make sure PostgreSQL is running');
  console.log('   2. Check DATABASE_URL in .env.local');
  console.log('   3. Ensure database exists and is accessible');
  process.exit(1);
}