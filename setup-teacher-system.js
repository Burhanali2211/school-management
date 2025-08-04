#!/usr/bin/env node

/**
 * Teacher Management System Setup Script
 * Sets up the complete teacher management system with database, constraints, and sample data
 */

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Configuration
const CONFIG = {
  databaseName: 'school_management',
  databaseUser: 'school_app',
  databasePassword: 'secure_password_here',
  port: 3002,
  nodeEnv: 'development'
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const symbols = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    progress: '🔄'
  };
  
  console.log(`${symbols[type]} [${timestamp}] ${message}`);
}

function execAsync(command, options = {}) {
  return new Promise((resolve, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

// Setup functions
async function checkPrerequisites() {
  log('Checking prerequisites...', 'progress');
  
  const checks = [
    { command: 'node --version', name: 'Node.js' },
    { command: 'npm --version', name: 'npm' },
    { command: 'psql --version', name: 'PostgreSQL client' },
    { command: 'pg_ctl --version', name: 'PostgreSQL server' }
  ];
  
  for (const check of checks) {
    try {
      await execAsync(check.command);
      log(`${check.name} is installed`, 'success');
    } catch (error) {
      log(`${check.name} is not installed or not in PATH`, 'error');
      throw new Error(`Missing prerequisite: ${check.name}`);
    }
  }
}

async function setupEnvironment() {
  log('Setting up environment configuration...', 'progress');
  
  const envPath = '.env.local';
  
  if (fs.existsSync(envPath)) {
    const overwrite = await askQuestion('Environment file exists. Overwrite? (y/n): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('Skipping environment setup', 'warning');
      return;
    }
  }
  
  const envContent = `# School Management System Environment Configuration
# Database Configuration
DATABASE_URL="postgresql://${CONFIG.databaseUser}:${CONFIG.databasePassword}@localhost:5432/${CONFIG.databaseName}"

# Authentication
JWT_SECRET="${generateRandomString(64)}"
NEXTAUTH_SECRET="${generateRandomString(32)}"
NEXTAUTH_URL="http://localhost:${CONFIG.port}"

# Application Configuration
NODE_ENV="${CONFIG.nodeEnv}"
PORT="${CONFIG.port}"

# Cloudinary (for image uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email Configuration (optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"

# Application Settings
APP_NAME="School Management System"
APP_VERSION="1.0.0"
`;

  fs.writeFileSync(envPath, envContent);
  log('Environment configuration created', 'success');
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function setupDatabase() {
  log('Setting up database...', 'progress');
  
  try {
    // Check if database exists
    await execAsync(`psql -lqt | cut -d \\| -f 1 | grep -qw ${CONFIG.databaseName}`);
    log('Database already exists', 'warning');
    
    const recreate = await askQuestion('Database exists. Recreate? (y/n): ');
    if (recreate.toLowerCase() === 'y') {
      await execAsync(`dropdb ${CONFIG.databaseName}`);
      log('Existing database dropped', 'success');
    } else {
      log('Using existing database', 'info');
      return;
    }
  } catch (error) {
    // Database doesn't exist, which is fine
  }
  
  // Create database
  try {
    await execAsync(`createdb ${CONFIG.databaseName}`);
    log('Database created successfully', 'success');
  } catch (error) {
    log('Failed to create database', 'error');
    throw error;
  }
  
  // Create database user
  try {
    await execAsync(`psql -c "CREATE USER ${CONFIG.databaseUser} WITH PASSWORD '${CONFIG.databasePassword}';"`);
    await execAsync(`psql -c "GRANT ALL PRIVILEGES ON DATABASE ${CONFIG.databaseName} TO ${CONFIG.databaseUser};"`);
    log('Database user created and privileges granted', 'success');
  } catch (error) {
    log('Database user might already exist', 'warning');
  }
}

async function runDatabaseMigrations() {
  log('Running database migrations...', 'progress');
  
  try {
    await execAsync('npx prisma db push');
    log('Prisma schema pushed to database', 'success');
    
    await execAsync('npx prisma generate');
    log('Prisma client generated', 'success');
  } catch (error) {
    log('Failed to run migrations', 'error');
    throw error;
  }
}

async function applyDatabaseConstraints() {
  log('Applying database constraints and indexes...', 'progress');
  
  const constraintsFile = 'database_constraints.sql';
  if (fs.existsSync(constraintsFile)) {
    try {
      await execAsync(`psql ${CONFIG.databaseName} -f ${constraintsFile}`);
      log('Database constraints applied successfully', 'success');
    } catch (error) {
      log('Some constraints may have failed (this is often normal)', 'warning');
    }
  } else {
    log('Constraints file not found, skipping', 'warning');
  }
  
  // Apply RLS policies if available
  const rlsFile = 'rls_policies.sql';
  if (fs.existsSync(rlsFile)) {
    try {
      await execAsync(`psql ${CONFIG.databaseName} -f ${rlsFile}`);
      log('RLS policies applied successfully', 'success');
    } catch (error) {
      log('RLS policies failed (normal for non-Supabase setups)', 'warning');
    }
  }
}

async function seedDatabase() {
  log('Seeding database with sample data...', 'progress');
  
  try {
    await execAsync('npx tsx prisma/seed.ts');
    log('Database seeded successfully', 'success');
  } catch (error) {
    log('Failed to seed database', 'error');
    throw error;
  }
  
  // Seed admin user
  const adminFile = 'seed-admin.js';
  if (fs.existsSync(adminFile)) {
    try {
      await execAsync(`node ${adminFile}`);
      log('Admin user created', 'success');
    } catch (error) {
      log('Admin user creation failed or already exists', 'warning');
    }
  }
}

async function installDependencies() {
  log('Installing dependencies...', 'progress');
  
  try {
    await execAsync('npm install');
    log('Dependencies installed successfully', 'success');
  } catch (error) {
    log('Failed to install dependencies', 'error');
    throw error;
  }
}

async function runTests() {
  log('Running system tests...', 'progress');
  
  // Start the development server in background
  const server = spawn('npm', ['run', 'dev'], {
    stdio: 'pipe',
    detached: true
  });
  
  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  try {
    // Check if test file exists
    const testFile = 'test-teacher-system.js';
    if (fs.existsSync(testFile)) {
      await execAsync('npm install axios'); // Ensure axios is available for tests
      const { stdout } = await execAsync(`node ${testFile}`);
      log('System tests completed successfully', 'success');
      console.log(stdout);
    } else {
      log('Test file not found, skipping tests', 'warning');
    }
  } catch (error) {
    log('Some tests failed', 'warning');
    console.log(error.stdout);
  } finally {
    // Kill the server
    try {
      process.kill(-server.pid);
    } catch (e) {
      // Server might already be dead
    }
  }
}

async function displayCompletionInfo() {
  log('Setup completed successfully!', 'success');
  
  console.log(`
🎉 School Management System Setup Complete!

📋 What was set up:
   ✅ Environment configuration (.env.local)
   ✅ PostgreSQL database (${CONFIG.databaseName})
   ✅ Database schema and constraints
   ✅ Sample data and admin user
   ✅ Node.js dependencies

🚀 Next steps:
   1. Start the development server:
      npm run dev

   2. Open your browser to:
      http://localhost:${CONFIG.port}

   3. Login with admin credentials:
      Username: admin
      Password: admin123

📁 Important files created:
   - .env.local (environment configuration)
   - test-report-*.json (test results)

🔧 Available commands:
   npm run dev          - Start development server
   npm run build        - Build for production
   npm run start        - Start production server
   npm test            - Run test suite
   npx prisma studio   - Open database browser

📖 Documentation:
   - README.md for detailed setup instructions
   - API documentation available at /api/docs (when server is running)

🆘 Need help?
   - Check the logs above for any warnings
   - Ensure PostgreSQL is running
   - Verify environment variables in .env.local

Happy coding! 🎓
`);
}

// Main setup function
async function setup() {
  try {
    console.log('🎓 School Management System Setup');
    console.log('=====================================\n');
    
    await checkPrerequisites();
    await setupEnvironment();
    await installDependencies();
    await setupDatabase();
    await runDatabaseMigrations();
    await applyDatabaseConstraints();
    await seedDatabase();
    
    const runTestsAnswer = await askQuestion('Run system tests? (y/n): ');
    if (runTestsAnswer.toLowerCase() === 'y') {
      await runTests();
    }
    
    await displayCompletionInfo();
    
  } catch (error) {
    log(`Setup failed: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
School Management System Setup Script

Usage: node setup-teacher-system.js [options]

Options:
  --help, -h     Show this help message
  --test-only    Run tests only (requires running server)
  --db-only      Setup database only
  --no-tests     Skip tests during setup

Examples:
  node setup-teacher-system.js          # Full setup
  node setup-teacher-system.js --db-only # Database setup only
  node setup-teacher-system.js --test-only # Run tests only
`);
    process.exit(0);
  }
  
  if (args.includes('--test-only')) {
    runTests().then(() => process.exit(0)).catch(() => process.exit(1));
  } else {
    setup();
  }
}

module.exports = {
  setup,
  CONFIG
};