import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

  // Create Classes
  console.log('🏫 Creating classes...');
  const classes = await Promise.all([
    prisma.class.create({ data: { name: 'Class 1 - Section A', capacity: 30, gradeId: grades[0].id, schoolId: school.id } }),
    prisma.class.create({ data: { name: 'Class 2 - Section A', capacity: 30, gradeId: grades[1].id, schoolId: school.id } }),
    prisma.class.create({ data: { name: 'Class 3 - Section A', capacity: 30, gradeId: grades[2].id, schoolId: school.id } }),
    prisma.class.create({ data: { name: 'Class 4 - Section A', capacity: 30, gradeId: grades[3].id, schoolId: school.id } }),
    prisma.class.create({ data: { name: 'Class 5 - Section A', capacity: 30, gradeId: grades[4].id, schoolId: school.id } }),
  ]);

  // Create Sections
  console.log('📋 Creating sections...');
  const sections = await Promise.all([
    prisma.section.create({ data: { name: 'Section A', capacity: 15, classId: classes[0].id, schoolId: school.id } }),
    prisma.section.create({ data: { name: 'Section B', capacity: 15, classId: classes[0].id, schoolId: school.id } }),
    prisma.section.create({ data: { name: 'Section A', capacity: 15, classId: classes[1].id, schoolId: school.id } }),
    prisma.section.create({ data: { name: 'Section B', capacity: 15, classId: classes[1].id, schoolId: school.id } }),
    prisma.section.create({ data: { name: 'Section A', capacity: 15, classId: classes[2].id, schoolId: school.id } }),
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

  // Create Admin with password
  console.log('👨‍💼 Creating admin...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.create({
    data: {
      id: 'admin1',
      username: 'admin1',
      password: adminPassword,
      name: 'Admin',
      surname: 'User',
      email: 'admin@schoolkhanda.edu.in',
    },
  });

  // Create Teachers with passwords
  console.log('👨‍🏫 Creating teachers...');
  const teacherPassword = await bcrypt.hash('teacher1123', 10);
  const teacher = await prisma.teacher.create({
    data: {
      id: 'teacher1',
      username: 'teacher1',
      password: teacherPassword,
      name: 'John',
      surname: 'Smith',
      email: 'teacher1@school.edu',
      phone: '+91-9876543210',
      address: 'Teacher Address, Khanda, Sonipat',
      bloodType: 'A+',
      sex: 'MALE',
      birthday: new Date('1985-05-15'),
    },
  });

  // Create Parent with password
  console.log('👨‍👩‍👧‍👦 Creating parent...');
  const parentPassword = await bcrypt.hash('parent1123', 10);
  const parent = await prisma.parent.create({
    data: {
      id: 'parent1',
      username: 'parent1',
      password: parentPassword,
      name: 'Robert',
      surname: 'Johnson',
      email: 'parent1@example.com',
      phone: '+91-9876543211',
      address: 'Parent Address, Khanda, Sonipat',
    },
  });

  // Create Student with password
  console.log('👨‍🎓 Creating student...');
  const studentPassword = await bcrypt.hash('student1123', 10);
  const student = await prisma.student.create({
    data: {
      id: 'student1',
      username: 'student1',
      password: studentPassword,
      name: 'Alice',
      surname: 'Johnson',
      email: 'student1@school.edu',
      phone: '+91-9876543212',
      address: 'Student Address, Khanda, Sonipat',
      bloodType: 'O+',
      sex: 'FEMALE',
      birthday: new Date('2010-08-20'),
      parentId: parent.id,
      classId: classes[0].id,
      gradeId: grades[0].id,
    },
  });

  console.log('✅ Database seeding completed successfully!');
  console.log('\n📋 Created Users:');
  console.log('👨‍💼 Admin: admin1 / admin123');
  console.log('👨‍🏫 Teacher: teacher1 / teacher1123');
  console.log('👨‍👩‍👧‍👦 Parent: parent1 / parent1123');
  console.log('👨‍🎓 Student: student1 / student1123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
