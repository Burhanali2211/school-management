const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateToHierarchical() {
  console.log('Starting hierarchical migration...');

  try {
    // Step 1: Create a default school
    console.log('Creating default school...');
    const defaultSchool = await prisma.school.upsert({
      where: { name: 'Default School' },
      update: {},
      create: {
        name: 'Default School',
        address: 'Default Address',
        phone: '+1234567890',
        email: 'admin@defaultschool.edu',
      },
    });

    console.log(`Default school created with ID: ${defaultSchool.id}`);

    // Step 2: Update all grades to belong to the default school
    console.log('Updating grades...');
    await prisma.grade.updateMany({
      where: { schoolId: null },
      data: { schoolId: defaultSchool.id },
    });

    // Step 3: Update all classes to belong to the default school
    console.log('Updating classes...');
    await prisma.class.updateMany({
      where: { schoolId: null },
      data: { schoolId: defaultSchool.id },
    });

    // Step 4: Create default sections for each class
    console.log('Creating default sections...');
    const classes = await prisma.class.findMany({
      include: { grade: true },
    });

    for (const classItem of classes) {
      // Create a default section for each class
      const section = await prisma.section.upsert({
        where: {
          classId_name: {
            classId: classItem.id,
            name: 'Section A',
          },
        },
        update: {},
        create: {
          name: 'Section A',
          capacity: classItem.capacity,
          schoolId: defaultSchool.id,
          classId: classItem.id,
        },
      });

      console.log(`Created section ${section.name} for class ${classItem.name}`);

      // Step 5: Move all students from this class to the default section
      await prisma.student.updateMany({
        where: {
          classId: classItem.id,
          sectionId: null,
        },
        data: {
          sectionId: section.id,
          schoolId: defaultSchool.id,
        },
      });
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateToHierarchical()
    .then(() => {
      console.log('Hierarchical migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

export default migrateToHierarchical;
