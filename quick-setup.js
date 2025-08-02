#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏫 School Management System - Quick Setup');
console.log('=========================================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Creating .env.local file...');
  const envContent = `# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/school_management"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production-${Math.random().toString(36).substring(7)}"
NEXTAUTH_SECRET="your-nextauth-secret-${Math.random().toString(36).substring(7)}"
NEXTAUTH_URL="http://localhost:3002"

# Optional: Cloudinary for file uploads
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Optional: Email configuration
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local created! Please update DATABASE_URL with your PostgreSQL credentials.\n');
}

// Check if node_modules exists
if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed!\n');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated!\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  console.log('Please make sure your DATABASE_URL is correct in .env.local\n');
}

// Check database connection and push schema
console.log('🗄️  Setting up database...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database schema updated!\n');
} catch (error) {
  console.error('❌ Failed to update database schema:', error.message);
  console.log('Please ensure:');
  console.log('1. PostgreSQL is running');
  console.log('2. Database exists');
  console.log('3. DATABASE_URL in .env.local is correct\n');
}

// Create sample data
console.log('📊 Creating sample data...');
const sampleDataScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create admin user
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      id: 'admin-1',
      username: 'admin'
    }
  });

  // Create sample school
  const school = await prisma.school.upsert({
    where: { name: 'Springfield Elementary' },
    update: {},
    create: {
      name: 'Springfield Elementary',
      address: '123 Main St, Springfield',
      phone: '+1-555-0123',
      email: 'info@springfield.edu'
    }
  });

  // Create grades
  const grades = [];
  for (let i = 1; i <= 12; i++) {
    const grade = await prisma.grade.upsert({
      where: { level: i },
      update: {},
      create: {
        level: i,
        schoolId: school.id
      }
    });
    grades.push(grade);
  }

  // Create subjects
  const subjects = [];
  const subjectNames = ['Mathematics', 'English', 'Science', 'History', 'Art', 'Physical Education', 'Music', 'Computer Science'];
  for (const name of subjectNames) {
    const subject = await prisma.subject.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    subjects.push(subject);
  }

  // Create sample teacher
  const teacher = await prisma.teacher.upsert({
    where: { username: 'teacher1' },
    update: {},
    create: {
      id: 'teacher-1',
      username: 'teacher1',
      name: 'John',
      surname: 'Smith',
      email: 'john.smith@school.edu',
      phone: '+1-555-0124',
      address: '456 Teacher St',
      bloodType: 'O+',
      sex: 'MALE',
      birthday: new Date('1985-05-15'),
      subjects: {
        connect: [{ id: subjects[0].id }, { id: subjects[1].id }]
      }
    }
  });

  // Create sample class
  const sampleClass = await prisma.class.upsert({
    where: { name: 'Class 1A' },
    update: {},
    create: {
      name: 'Class 1A',
      capacity: 30,
      gradeId: grades[0].id,
      schoolId: school.id,
      supervisorId: teacher.id
    }
  });

  // Create sample parent
  const parent = await prisma.parent.upsert({
    where: { username: 'parent1' },
    update: {},
    create: {
      id: 'parent-1',
      username: 'parent1',
      name: 'Jane',
      surname: 'Doe',
      email: 'jane.doe@email.com',
      phone: '+1-555-0125',
      address: '789 Parent Ave'
    }
  });

  // Create sample student
  await prisma.student.upsert({
    where: { username: 'student1' },
    update: {},
    create: {
      id: 'student-1',
      username: 'student1',
      name: 'Alice',
      surname: 'Doe',
      email: 'alice.doe@student.edu',
      phone: '+1-555-0126',
      address: '789 Parent Ave',
      bloodType: 'A+',
      sex: 'FEMALE',
      birthday: new Date('2010-03-20'),
      parentId: parent.id,
      classId: sampleClass.id,
      gradeId: grades[0].id,
      schoolId: school.id
    }
  });

  console.log('✅ Sample data created successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error creating sample data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

fs.writeFileSync(path.join(__dirname, 'seed-temp.js'), sampleDataScript);

try {
  execSync('node seed-temp.js', { stdio: 'inherit' });
  fs.unlinkSync(path.join(__dirname, 'seed-temp.js'));
  console.log('✅ Sample data created!\n');
} catch (error) {
  console.error('❌ Failed to create sample data:', error.message);
  fs.unlinkSync(path.join(__dirname, 'seed-temp.js'));
}

console.log('🎉 Setup Complete!');
console.log('==================\n');
console.log('Your School Management System is ready!');
console.log('\n📋 Default Login Credentials:');
console.log('Admin: username="admin", password="admin123"');
console.log('Teacher: username="teacher1", password="teacher1123"');
console.log('Student: username="student1", password="student1123"');
console.log('Parent: username="parent1", password="parent1123"');
console.log('\n🚀 To start the development server:');
console.log('npm run dev');
console.log('\n🌐 Application will be available at:');
console.log('http://localhost:3002');
console.log('\n📚 For more information, see:');
console.log('- setup-complete-system.md');
console.log('- BEST_PRACTICES.md');
console.log('- README.md');