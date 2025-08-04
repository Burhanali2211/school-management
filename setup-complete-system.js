#!/usr/bin/env node

console.log('🚀 Complete School Management System Setup\n');

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

function createFile(filePath, content, description) {
  console.log(`📝 Creating ${description}...`);
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ ${description} created\n`);
  } catch (error) {
    console.log(`❌ Failed to create ${description}: ${error.message}\n`);
    return false;
  }
  return true;
}

// Step 1: Install dependencies if needed
console.log('🔧 Checking dependencies...');
if (!fs.existsSync('node_modules')) {
  runCommand('npm install', 'Installing dependencies');
}

// Step 2: Create comprehensive seed script
const seedScript = `
import { PrismaClient, UserSex, Day, UserType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.result.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.student.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.section.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.school.deleteMany();

  // Create School
  console.log('🏫 Creating school...');
  const school = await prisma.school.create({
    data: {
      name: 'Govt. Higher Secondary School Khanda',
      address: 'Khanda, Sonipat, Haryana, India',
      phone: '+91-1234567890',
      email: 'admin@schoolkhanda.edu.in',
    },
  });

  // Create Grades
  console.log('📚 Creating grades...');
  const grades = await Promise.all([
    prisma.grade.create({ data: { name: 'Class 1', level: 1, schoolId: school.id } }),
    prisma.grade.create({ data: { name: 'Class 2', level: 2, schoolId: school.id } }),
    prisma.grade.create({ data: { name: 'Class 3', level: 3, schoolId: school.id } }),
    prisma.grade.create({ data: { name: 'Class 4', level: 4, schoolId: school.id } }),
    prisma.grade.create({ data: { name: 'Class 5', level: 5, schoolId: school.id } }),
    prisma.grade.create({ data: { name: 'Class 6', level: 6, schoolId: school.id } }),
    prisma.grade.create({ data: { name: 'Class 7', level: 7, schoolId: school.id } }),
    prisma.grade.create({ data: { name: 'Class 8', level: 8, schoolId: school.id } }),
    prisma.grade.create({ data: { name: 'Class 9', level: 9, schoolId: school.id } }),
    prisma.grade.create({ data: { name: 'Class 10', level: 10, schoolId: school.id } }),
    prisma.grade.create({ data: { name: 'Class 11', level: 11, schoolId: school.id } }),
    prisma.grade.create({ data: { name: 'Class 12', level: 12, schoolId: school.id } }),
  ]);

  // Create Subjects
  console.log('📖 Creating subjects...');
  const subjects = await Promise.all([
    prisma.subject.create({ data: { name: 'Mathematics' } }),
    prisma.subject.create({ data: { name: 'Science' } }),
    prisma.subject.create({ data: { name: 'English' } }),
    prisma.subject.create({ data: { name: 'Hindi' } }),
    prisma.subject.create({ data: { name: 'Social Studies' } }),
    prisma.subject.create({ data: { name: 'Physics' } }),
    prisma.subject.create({ data: { name: 'Chemistry' } }),
    prisma.subject.create({ data: { name: 'Biology' } }),
    prisma.subject.create({ data: { name: 'Computer Science' } }),
    prisma.subject.create({ data: { name: 'Physical Education' } }),
  ]);

  // Create Admin
  console.log('👨‍💼 Creating admin...');
  const admin = await prisma.admin.create({
    data: {
      id: 'admin1',
      username: 'admin1',
    },
  });

  // Create Teachers
  console.log('👨‍🏫 Creating teachers...');
  const teachers = [];
  for (let i = 1; i <= 10; i++) {
    const teacher = await prisma.teacher.create({
      data: {
        id: \`teacher\${i}\`,
        username: \`teacher\${i}\`,
        name: \`Teacher\${i}\`,
        surname: \`Surname\${i}\`,
        email: \`teacher\${i}@school.edu\`,
        phone: \`+91-98765432\${i.toString().padStart(2, '0')}\`,
        address: \`Address \${i}, Khanda, Sonipat\`,
        bloodType: ['A+', 'B+', 'O+', 'AB+'][i % 4],
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(1980 + (i % 20), (i % 12), (i % 28) + 1),
        subjects: {
          connect: [{ id: subjects[i % subjects.length].id }]
        }
      },
    });
    teachers.push(teacher);
  }

  // Create Classes
  console.log('🏛️ Creating classes...');
  const classes = [];
  for (let i = 0; i < grades.length; i++) {
    const classData = await prisma.class.create({
      data: {
        name: \`\${grades[i].name} - A\`,
        capacity: 40,
        gradeId: grades[i].id,
        schoolId: school.id,
        supervisorId: teachers[i % teachers.length].id,
      },
    });
    classes.push(classData);
  }

  // Create Sections
  console.log('📋 Creating sections...');
  for (const classItem of classes) {
    await prisma.section.create({
      data: {
        name: 'Section A',
        capacity: 40,
        schoolId: school.id,
        classId: classItem.id,
      },
    });
  }

  // Create Parents
  console.log('👨‍👩‍👧‍👦 Creating parents...');
  const parents = [];
  for (let i = 1; i <= 20; i++) {
    const parent = await prisma.parent.create({
      data: {
        id: \`parent\${i}\`,
        username: \`parent\${i}\`,
        name: \`Parent\${i}\`,
        surname: \`Surname\${i}\`,
        email: \`parent\${i}@email.com\`,
        phone: \`+91-87654321\${i.toString().padStart(2, '0')}\`,
        address: \`Address \${i}, Khanda, Sonipat\`,
      },
    });
    parents.push(parent);
  }

  // Create Students
  console.log('👨‍🎓 Creating students...');
  const students = [];
  for (let i = 1; i <= 50; i++) {
    const student = await prisma.student.create({
      data: {
        id: \`student\${i}\`,
        username: \`student\${i}\`,
        name: \`Student\${i}\`,
        surname: \`Surname\${i}\`,
        email: \`student\${i}@school.edu\`,
        phone: \`+91-76543210\${i.toString().padStart(2, '0')}\`,
        address: \`Address \${i}, Khanda, Sonipat\`,
        bloodType: ['A+', 'B+', 'O+', 'AB+'][i % 4],
        sex: i % 2 === 0 ? UserSex.MALE : UserSex.FEMALE,
        birthday: new Date(2005 + (i % 10), (i % 12), (i % 28) + 1),
        parentId: parents[i % parents.length].id,
        classId: classes[i % classes.length].id,
        gradeId: grades[i % grades.length].id,
        schoolId: school.id,
      },
    });
    students.push(student);
  }

  // Create Lessons
  console.log('📅 Creating lessons...');
  const days = [Day.MONDAY, Day.TUESDAY, Day.WEDNESDAY, Day.THURSDAY, Day.FRIDAY];
  for (let i = 0; i < 20; i++) {
    await prisma.lesson.create({
      data: {
        name: \`\${subjects[i % subjects.length].name} - \${classes[i % classes.length].name}\`,
        day: days[i % days.length],
        startTime: new Date(2024, 0, 1, 9 + (i % 6), 0),
        endTime: new Date(2024, 0, 1, 10 + (i % 6), 0),
        subjectId: subjects[i % subjects.length].id,
        classId: classes[i % classes.length].id,
        teacherId: teachers[i % teachers.length].id,
      },
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(\`📊 Created:
  - 1 School
  - 12 Grades
  - 10 Subjects
  - 1 Admin
  - 10 Teachers
  - 12 Classes
  - 12 Sections
  - 20 Parents
  - 50 Students
  - 20 Lessons\`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

createFile('prisma/seed-complete.ts', seedScript, 'comprehensive seed script');

// Step 3: Create development startup script
const devScript = `#!/usr/bin/env node

console.log('🚀 Starting School Management System Development Server\\n');

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(\`📋 \${description}...\`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(\`✅ \${description} completed\\n\`);
  } catch (error) {
    console.log(\`❌ \${description} failed: \${error.message}\\n\`);
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
console.log('   Parent: parent1 / parent1123\\n');

runCommand('npm run dev', 'Starting development server');
`;

createFile('dev-start-complete.js', devScript, 'development startup script');

// Step 4: Create production build script
const buildScript = `#!/usr/bin/env node

console.log('🏗️ Building School Management System for Production\\n');

const { execSync } = require('child_process');

function runCommand(command, description) {
  console.log(\`📋 \${description}...\`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(\`✅ \${description} completed\\n\`);
  } catch (error) {
    console.log(\`❌ \${description} failed: \${error.message}\\n\`);
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
`;

createFile('build-production.js', buildScript, 'production build script');

// Step 5: Update package.json scripts
console.log('📝 Updating package.json scripts...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
packageJson.scripts = {
  ...packageJson.scripts,
  'setup': 'node setup-complete-system.js',
  'dev:complete': 'node dev-start-complete.js',
  'build:production': 'node build-production.js',
  'seed:complete': 'npx tsx prisma/seed-complete.ts',
  'db:reset': 'npx prisma db push --force-reset && npm run seed:complete',
  'test:all': 'npm run test && node test-production-readiness.js && node test-api-comprehensive.js'
};

fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
console.log('✅ Package.json updated\n');

// Step 6: Create README with instructions
const readme = `# School Management System

A comprehensive, production-ready school management system built with Next.js, Prisma, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies: \`npm install\`
3. Configure environment variables in \`.env.local\`
4. Run setup: \`npm run setup\`
5. Start development server: \`npm run dev:complete\`

### Demo Credentials
- **Admin**: admin1 / admin123
- **Teacher**: teacher1 / teacher1123  
- **Student**: student1 / student1123
- **Parent**: parent1 / parent1123

## 🏗️ Architecture

### Backend
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based sessions
- **API**: RESTful APIs with proper error handling
- **Security**: Role-based access control, input validation

### Frontend  
- **UI**: React with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context + hooks
- **Forms**: React Hook Form with Zod validation

### Features
- ✅ User management (Admin, Teachers, Students, Parents)
- ✅ Class and subject management
- ✅ Attendance tracking
- ✅ Grade and exam management
- ✅ Assignment management
- ✅ Messaging system
- ✅ Dashboard analytics
- ✅ Audit logging
- ✅ Session management
- ✅ Role-based permissions

## 🛠️ Development

### Available Scripts
- \`npm run dev\` - Start development server
- \`npm run dev:complete\` - Full setup + start development
- \`npm run build\` - Build for production
- \`npm run build:production\` - Full production build with checks
- \`npm run test\` - Run tests
- \`npm run test:all\` - Run all tests including architecture checks
- \`npm run seed:complete\` - Seed database with sample data
- \`npm run db:reset\` - Reset and reseed database

### Database Management
- \`npx prisma studio\` - Open Prisma Studio
- \`npx prisma db push\` - Push schema changes
- \`npx prisma generate\` - Generate Prisma client

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Session management
- Audit logging

## 📱 Production Deployment

1. Set up PostgreSQL database
2. Configure production environment variables
3. Run \`npm run build:production\`
4. Deploy to your hosting platform

## 🧪 Testing

The system includes comprehensive tests:
- Unit tests for components
- API route tests
- Authentication tests
- Production readiness checks
- Architecture validation

Run all tests: \`npm run test:all\`

## 📚 Documentation

- API documentation available at \`/api/docs\` (when running)
- Database schema in \`prisma/schema.prisma\`
- Component documentation in respective files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: \`npm run test:all\`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
`;

createFile('README.md', readme, 'comprehensive README');

console.log('🎉 Complete School Management System setup finished!');
console.log('📋 Next steps:');
console.log('   1. Configure your database in .env.local');
console.log('   2. Run: npm run dev:complete');
console.log('   3. Open: http://localhost:3002');
console.log('   4. Login with demo credentials\n');