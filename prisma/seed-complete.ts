
import { PrismaClient, Day, UserType } from '@prisma/client';

// Define UserSex enum locally since it's not exported from Prisma client
enum UserSex {
  MALE = 'MALE',
  FEMALE = 'FEMALE'
}

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
      password: 'admin123',
      name: 'Admin',
      surname: 'User',
      email: 'admin@school.edu',
    },
  });

  // Create Teachers
  console.log('👨‍🏫 Creating teachers...');
  const teachers = [];
  for (let i = 1; i <= 10; i++) {
    const teacher = await prisma.teacher.create({
      data: {
        id: `teacher${i}`,
        username: `teacher${i}`,
        password: `teacher${i}123`,
        name: `Teacher${i}`,
        surname: `Surname${i}`,
        email: `teacher${i}@school.edu`,
        phone: `+91-98765432${i.toString().padStart(2, '0')}`,
        address: `Address ${i}, Khanda, Sonipat`,
        bloodType: ['A+', 'B+', 'O+', 'AB+'][i % 4] || 'A+',
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
        name: `${grades[i].name} - A`,
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
        id: `parent${i}`,
        username: `parent${i}`,
        password: `parent${i}123`,
        name: `Parent${i}`,
        surname: `Surname${i}`,
        email: `parent${i}@email.com`,
        phone: `+91-87654321${i.toString().padStart(2, '0')}`,
        address: `Address ${i}, Khanda, Sonipat`,
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
        id: `student${i}`,
        username: `student${i}`,
        password: `student${i}123`,
        name: `Student${i}`,
        surname: `Surname${i}`,
        email: `student${i}@school.edu`,
        phone: `+91-76543210${i.toString().padStart(2, '0')}`,
        address: `Address ${i}, Khanda, Sonipat`,
        bloodType: ['A+', 'B+', 'O+', 'AB+'][i % 4] || 'A+',
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
        name: `${subjects[i % subjects.length].name} - ${classes[i % classes.length].name}`,
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
  console.log(`📊 Created:
  - 1 School
  - 12 Grades
  - 10 Subjects
  - 1 Admin
  - 10 Teachers
  - 12 Classes
  - 12 Sections
  - 20 Parents
  - 50 Students
  - 20 Lessons`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
