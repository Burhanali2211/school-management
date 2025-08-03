const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create admin user
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      id: 'admin',
      username: 'admin',
    },
  });

  // Create a parent for testing
  await prisma.parent.upsert({
    where: { username: 'testparent' },
    update: {},
    create: {
      id: 'testparent',
      username: 'testparent',
      name: 'Test',
      surname: 'Parent',
      email: 'testparent@example.com',
      phone: '123-456-7890',
      address: 'Test Address',
    },
  });

  // Create a grade
  await prisma.grade.upsert({
    where: { level: 1 },
    update: {},
    create: {
      level: 1,
    },
  });

  // Create a class
  await prisma.class.upsert({
    where: { name: '1A' },
    update: {},
    create: {
      name: '1A',
      capacity: 20,
      gradeId: 1,
    },
  });

  console.log('Admin and test data seeded successfully');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
