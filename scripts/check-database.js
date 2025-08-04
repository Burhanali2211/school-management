#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(process.cwd(), '.env.local') });

async function checkDatabase() {
  console.log('🔍 Checking database connection and setup...\n');

  const prisma = new PrismaClient();

  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Check if tables exist
    console.log('📋 Checking database tables...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. Database needs to be set up.');
      return false;
    }

    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(table => console.log(`   • ${table.table_name}`));
    console.log('');

    // Check if admin user exists
    console.log('👤 Checking admin user...');
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      console.log('⚠️  No admin users found. Database needs seeding.');
      return false;
    }
    console.log(`✅ Found ${adminCount} admin user(s)\n`);

    // Check other entities
    const [studentCount, teacherCount, classCount] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count()
    ]);

    console.log('📊 Database statistics:');
    console.log(`   • Students: ${studentCount}`);
    console.log(`   • Teachers: ${teacherCount}`);
    console.log(`   • Classes: ${classCount}`);
    console.log('');

    console.log('🎉 Database is properly set up and ready to use!');
    return true;

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n🔧 Connection failed. Please check:');
      console.log('   1. PostgreSQL server is running');
      console.log('   2. DATABASE_URL in .env.local is correct');
      console.log('   3. Database exists and credentials are valid');
    } else if (error.code === 'P2021') {
      console.log('\n🔧 Table not found. Please run:');
      console.log('   npm run setup:db');
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase().then(success => {
  process.exit(success ? 0 : 1);
});