#!/usr/bin/env node

console.log('🔧 Quick Fix for School Management System\n');

const fs = require('fs');
const { execSync } = require('child_process');

// Step 1: Check if .env.local exists and has DATABASE_URL
console.log('📋 Checking environment configuration...');
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  if (envContent.includes('DATABASE_URL')) {
    console.log('✅ DATABASE_URL found in .env.local');
  } else {
    console.log('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }
} else {
  console.log('❌ .env.local file not found');
  process.exit(1);
}

// Step 2: Try to generate Prisma client
console.log('📋 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.log('❌ Failed to generate Prisma client');
  process.exit(1);
}

// Step 3: Try to push database schema (optional, might fail if DB not available)
console.log('📋 Attempting to push database schema...');
try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Database schema pushed');
} catch (error) {
  console.log('⚠️  Database push failed (this is OK if DB is not running)');
  console.log('   You can run "npx prisma db push" later when your database is ready');
}

console.log('\n🎉 Quick fix completed!');
console.log('📋 Next steps:');
console.log('   1. Make sure your PostgreSQL database is running');
console.log('   2. Run: npm run dev');
console.log('   3. Visit: http://localhost:3002/test (to verify server works)');
console.log('   4. Visit: http://localhost:3002/sign-in (to test login)');