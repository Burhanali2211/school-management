import { PrismaClient, UserType, MessageType, MessagePriority } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedMessages() {
  console.log('Seeding messages...');

  try {
    // Get some sample users
    const admin = await prisma.admin.findFirst();
    const teachers = await prisma.teacher.findMany({ take: 5 });
    const students = await prisma.student.findMany({ take: 10 });
    const parents = await prisma.parent.findMany({ take: 10 });

    if (!admin || teachers.length === 0 || students.length === 0 || parents.length === 0) {
      console.log('Not enough users found. Please run the main seed first.');
      return;
    }

    // Sample messages
    const messages = [
      {
        senderId: admin.id,
        senderType: UserType.ADMIN,
        senderName: 'Admin User',
        content: 'Welcome to the new school year! Please review the updated school policies in the student handbook.',
        subject: 'Welcome Back - New School Year',
        messageType: MessageType.BROADCAST,
        priority: MessagePriority.HIGH,
        recipients: [
          ...teachers.map(t => ({ userId: t.id, userType: UserType.TEACHER, userName: `${t.name} ${t.surname}` })),
          ...students.slice(0, 5).map(s => ({ userId: s.id, userType: UserType.STUDENT, userName: `${s.name} ${s.surname}` })),
          ...parents.slice(0, 5).map(p => ({ userId: p.id, userType: UserType.PARENT, userName: `${p.name} ${p.surname}` })),
        ],
      },
      {
        senderId: teachers[0].id,
        senderType: UserType.TEACHER,
        senderName: `${teachers[0].name} ${teachers[0].surname}`,
        content: 'This is to inform you that your child has been performing exceptionally well in Mathematics. Keep up the great work!',
        subject: 'Great Progress in Mathematics',
        messageType: MessageType.DIRECT,
        priority: MessagePriority.NORMAL,
        recipients: [
          { userId: parents[0].id, userType: UserType.PARENT, userName: `${parents[0].name} ${parents[0].surname}` },
        ],
      },
      {
        senderId: students[0].id,
        senderType: UserType.STUDENT,
        senderName: `${students[0].name} ${students[0].surname}`,
        content: 'Could you please provide clarification on the homework assignment for Chapter 5? I want to make sure I understand the requirements correctly.',
        subject: 'Question about Homework Assignment',
        messageType: MessageType.DIRECT,
        priority: MessagePriority.NORMAL,
        recipients: [
          { userId: teachers[0].id, userType: UserType.TEACHER, userName: `${teachers[0].name} ${teachers[0].surname}` },
        ],
      },
      {
        senderId: parents[0].id,
        senderType: UserType.PARENT,
        senderName: `${parents[0].name} ${parents[0].surname}`,
        content: 'I would like to schedule a meeting to discuss my child\'s progress. Please let me know your available times.',
        subject: 'Request for Parent-Teacher Meeting',
        messageType: MessageType.DIRECT,
        priority: MessagePriority.HIGH,
        recipients: [
          { userId: teachers[0].id, userType: UserType.TEACHER, userName: `${teachers[0].name} ${teachers[0].surname}` },
        ],
      },
      {
        senderId: admin.id,
        senderType: UserType.ADMIN,
        senderName: 'Admin User',
        content: 'There will be a fire drill scheduled for tomorrow at 2:00 PM. Please ensure all students are prepared and know the evacuation procedures.',
        subject: 'Fire Drill Scheduled for Tomorrow',
        messageType: MessageType.BROADCAST,
        priority: MessagePriority.URGENT,
        recipients: [
          ...teachers.map(t => ({ userId: t.id, userType: UserType.TEACHER, userName: `${t.name} ${t.surname}` })),
        ],
      },
      {
        senderId: teachers[1].id,
        senderType: UserType.TEACHER,
        senderName: `${teachers[1].name} ${teachers[1].surname}`,
        content: 'Reminder: Science project presentations are due next Friday. Please make sure your projects are complete and ready to present.',
        subject: 'Science Project Presentation Reminder',
        messageType: MessageType.DIRECT,
        priority: MessagePriority.NORMAL,
        recipients: [
          ...students.slice(0, 8).map(s => ({ userId: s.id, userType: UserType.STUDENT, userName: `${s.name} ${s.surname}` })),
        ],
      },
      {
        senderId: teachers[2].id,
        senderType: UserType.TEACHER,
        senderName: `${teachers[2].name} ${teachers[2].surname}`,
        content: 'Your child has been absent for three consecutive days. Please contact the school office to discuss the situation.',
        subject: 'Concerning Absence Pattern',
        messageType: MessageType.DIRECT,
        priority: MessagePriority.HIGH,
        recipients: [
          { userId: parents[1].id, userType: UserType.PARENT, userName: `${parents[1].name} ${parents[1].surname}` },
        ],
      },
      {
        senderId: students[1].id,
        senderType: UserType.STUDENT,
        senderName: `${students[1].name} ${students[1].surname}`,
        content: 'Thank you for the extra help with the math problems. I finally understand the concept!',
        subject: 'Thank You for Extra Help',
        messageType: MessageType.DIRECT,
        priority: MessagePriority.LOW,
        recipients: [
          { userId: teachers[0].id, userType: UserType.TEACHER, userName: `${teachers[0].name} ${teachers[0].surname}` },
        ],
      },
      {
        senderId: admin.id,
        senderType: UserType.ADMIN,
        senderName: 'Admin User',
        content: 'The school will be closed next Monday due to a scheduled maintenance. Classes will resume on Tuesday.',
        subject: 'School Closure - Maintenance Day',
        messageType: MessageType.BROADCAST,
        priority: MessagePriority.HIGH,
        recipients: [
          ...teachers.map(t => ({ userId: t.id, userType: UserType.TEACHER, userName: `${t.name} ${t.surname}` })),
          ...students.map(s => ({ userId: s.id, userType: UserType.STUDENT, userName: `${s.name} ${s.surname}` })),
          ...parents.map(p => ({ userId: p.id, userType: UserType.PARENT, userName: `${p.name} ${p.surname}` })),
        ],
      },
      {
        senderId: teachers[3].id,
        senderType: UserType.TEACHER,
        senderName: `${teachers[3].name} ${teachers[3].surname}`,
        content: 'I wanted to let you know that your child showed excellent leadership skills during our group project. They helped their classmates and contributed significantly to the team\'s success.',
        subject: 'Excellent Leadership Skills Displayed',
        messageType: MessageType.DIRECT,
        priority: MessagePriority.NORMAL,
        recipients: [
          { userId: parents[2].id, userType: UserType.PARENT, userName: `${parents[2].name} ${parents[2].surname}` },
        ],
      },
    ];

    // Create messages
    for (const messageData of messages) {
      const message = await prisma.message.create({
        data: {
          senderId: messageData.senderId,
          senderType: messageData.senderType,
          senderName: messageData.senderName,
          content: messageData.content,
          subject: messageData.subject,
          messageType: messageData.messageType,
          priority: messageData.priority,
          recipients: {
            create: messageData.recipients.map(recipient => ({
              userId: recipient.userId,
              userType: recipient.userType,
              userName: recipient.userName,
              readAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null, // 50% chance of being read
            })),
          },
        },
      });

      console.log(`Created message: ${message.subject}`);
    }

    console.log(`✅ Successfully seeded ${messages.length} messages`);
  } catch (error) {
    console.error('Error seeding messages:', error);
  }
}

if (require.main === module) {
  seedMessages()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
