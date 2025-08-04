#!/usr/bin/env node

console.log('🏗️ Building School Management System for Production\n');

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

// Step 1: Install dependencies
if (!runCommand('npm ci', 'Installing production dependencies')) {
  process.exit(1);
}

// Step 2: Generate Prisma client
if (!runCommand('npx prisma generate', 'Generating Prisma client')) {
  process.exit(1);
}

// Step 3: Run type checking
if (!runCommand('npx tsc --noEmit', 'Type checking')) {
  process.exit(1);
}

// Step 4: Run linting
if (!runCommand('npm run lint', 'Linting code')) {
  process.exit(1);
}

// Step 5: Build application
if (!runCommand('npm run build', 'Building application')) {
  process.exit(1);
}

console.log('🎉 Production build completed successfully!');
console.log('🚀 You can now deploy the application.');
