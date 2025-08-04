#!/usr/bin/env node

console.log('🚀 Starting School Management System Development Server\n');

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.log(`❌ ${description} failed: ${error.message}\n`);
    return false;
  }
  return true;
}

// Step 1: Generate Prisma client
if (!runCommand('npx prisma generate', 'Generating Prisma client')) {
  process.exit(1);
}

// Step 2: Push database schema
if (!runCommand('npx prisma db push', 'Pushing database schema')) {
  process.exit(1);
}

// Step 3: Seed database
if (!runCommand('npx tsx prisma/seed-complete.ts', 'Seeding database')) {
  process.exit(1);
}

// Step 4: Start development server
console.log('🌐 Starting Next.js development server...');
console.log('📱 Application will be available at: http://localhost:3002');
console.log('🔐 Demo credentials:');
console.log('   Admin: admin1 / admin123');
console.log('   Teacher: teacher1 / teacher1123');
console.log('   Student: student1 / student1123');
console.log('   Parent: parent1 / parent1123\n');

runCommand('npm run dev', 'Starting development server');
