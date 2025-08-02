import { UserType, MessageType, MessagePriority } from "@prisma/client";
import prisma from "./prisma";
import { logAudit } from "./auth-service";

// Types
interface MessageData {
  content: string;
  subject?: string;
  messageType?: MessageType;
  priority?: MessagePriority;
  recipients: Array<{
    userId: string;
    userType: UserType;
    userName: string;
  }>;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }>;
  threadId?: string;
  parentId?: string;
}

interface MessageFilter {
  userId: string;
  userType: UserType;
  messageType?: MessageType;
  priority?: MessagePriority;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}

interface BroadcastMessageData {
  content: string;
  subject?: string;
  priority?: MessagePriority;
  targetUserTypes?: UserType[];
  classIds?: number[];
  gradeIds?: number[];
}

// Core messaging functions
export async function sendMessage(
  senderId: string,
  senderType: UserType,
  messageData: MessageData
): Promise<string> {
  try {
    // Get sender information
    const senderInfo = await getUserInfo(senderId, senderType);
    if (!senderInfo) {
      throw new Error("Sender not found");
    }

    // Validate recipients
    const validRecipients = await validateRecipients(messageData.recipients);
    if (validRecipients.length === 0) {
      throw new Error("No valid recipients found");
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        senderId,
        senderType,
        senderName: `${senderInfo.name} ${senderInfo.surname}`,
        content: messageData.content,
        subject: messageData.subject,
        messageType: messageData.messageType || MessageType.DIRECT,
        priority: messageData.priority || MessagePriority.NORMAL,
        threadId: messageData.threadId,
        parentId: messageData.parentId,
        recipients: {
          create: validRecipients.map(recipient => ({
            userId: recipient.userId,
            userType: recipient.userType,
            userName: recipient.userName,
          })),
        },
        attachments: messageData.attachments ? {
          create: messageData.attachments.map(attachment => ({
            fileName: attachment.fileName,
            fileUrl: attachment.fileUrl,
            fileSize: attachment.fileSize,
            mimeType: attachment.mimeType,
          })),
        } : undefined,
      },
      include: {
        recipients: true,
        attachments: true,
      },
    });

    // Log the action
    await logAudit(
      senderId,
      senderType,
      "SEND_MESSAGE",
      "Message",
      message.id,
      { recipients: validRecipients.length, messageType: messageData.messageType }
    );

    return message.id;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export async function getMessages(filter: MessageFilter) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          // Messages sent by the user
          {
            senderId: filter.userId,
            senderType: filter.userType,
          },
          // Messages received by the user
          {
            recipients: {
              some: {
                userId: filter.userId,
                userType: filter.userType,
                deletedAt: null,
                ...(filter.unreadOnly && { readAt: null }),
              },
            },
          },
        ],
        ...(filter.messageType && { messageType: filter.messageType }),
        ...(filter.priority && { priority: filter.priority }),
      },
      include: {
        recipients: {
          where: {
            userId: filter.userId,
            userType: filter.userType,
          },
        },
        attachments: true,
        _count: {
          select: { replies: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filter.limit || 50,
      skip: filter.offset || 0,
    });

    return messages.map(message => ({
      ...message,
      isRead: message.recipients.length > 0 ? !!message.recipients[0].readAt : false,
      isSent: message.senderId === filter.userId,
    }));
  } catch (error) {
    console.error("Error fetching messages:", error);
    throw error;
  }
}

export async function getMessageById(messageId: string, userId: string, userType: UserType) {
  try {
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: userId, senderType: userType },
          {
            recipients: {
              some: {
                userId,
                userType,
                deletedAt: null,
              },
            },
          },
        ],
      },
      include: {
        recipients: {
          where: {
            userId,
            userType,
          },
        },
        attachments: true,
        replies: {
          include: {
            recipients: {
              where: {
                userId,
                userType,
              },
            },
            attachments: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        parent: {
          include: {
            recipients: {
              where: {
                userId,
                userType,
              },
            },
            attachments: true,
          },
        },
      },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    return {
      ...message,
      isRead: message.recipients.length > 0 ? !!message.recipients[0].readAt : false,
      isSent: message.senderId === userId,
    };
  } catch (error) {
    console.error("Error fetching message:", error);
    throw error;
  }
}

export async function markAsRead(messageId: string, userId: string, userType: UserType) {
  try {
    await prisma.messageRecipient.updateMany({
      where: {
        messageId,
        userId,
        userType,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    await logAudit(userId, userType, "READ_MESSAGE", "Message", messageId);
  } catch (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
}

export async function deleteMessage(messageId: string, userId: string, userType: UserType) {
  try {
    // Check if user is the sender or recipient
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [
          { senderId: userId, senderType: userType },
          {
            recipients: {
              some: {
                userId,
                userType,
              },
            },
          },
        ],
      },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    // If user is the sender, delete the entire message
    if (message.senderId === userId) {
      await prisma.message.delete({
        where: { id: messageId },
      });
    } else {
      // If user is recipient, mark as deleted for them
      await prisma.messageRecipient.updateMany({
        where: {
          messageId,
          userId,
          userType,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }

    await logAudit(userId, userType, "DELETE_MESSAGE", "Message", messageId);
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
}

export async function broadcastMessage(
  senderId: string,
  senderType: UserType,
  messageData: BroadcastMessageData
) {
  try {
    // Get sender information
    const senderInfo = await getUserInfo(senderId, senderType);
    if (!senderInfo) {
      throw new Error("Sender not found");
    }

    // Get recipients based on criteria
    const recipients = await getBroadcastRecipients(messageData);

    if (recipients.length === 0) {
      throw new Error("No recipients found for broadcast");
    }

    // Create broadcast message
    const message = await prisma.message.create({
      data: {
        senderId,
        senderType,
        senderName: `${senderInfo.name} ${senderInfo.surname}`,
        content: messageData.content,
        subject: messageData.subject,
        messageType: MessageType.BROADCAST,
        priority: messageData.priority || MessagePriority.NORMAL,
        recipients: {
          create: recipients.map(recipient => ({
            userId: recipient.userId,
            userType: recipient.userType,
            userName: recipient.userName,
          })),
        },
      },
    });

    await logAudit(
      senderId,
      senderType,
      "BROADCAST_MESSAGE",
      "Message",
      message.id,
      { recipients: recipients.length, targetUserTypes: messageData.targetUserTypes }
    );

    return message.id;
  } catch (error) {
    console.error("Error broadcasting message:", error);
    throw error;
  }
}

export async function getUnreadCount(userId: string, userType: UserType): Promise<number> {
  try {
    const count = await prisma.messageRecipient.count({
      where: {
        userId,
        userType,
        readAt: null,
        deletedAt: null,
      },
    });

    return count;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}

export async function searchMessages(
  userId: string,
  userType: UserType,
  query: string,
  limit: number = 20
) {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            senderId: userId,
            senderType: userType,
          },
          {
            recipients: {
              some: {
                userId,
                userType,
                deletedAt: null,
              },
            },
          },
        ],
        AND: [
          {
            OR: [
              { content: { contains: query, mode: 'insensitive' } },
              { subject: { contains: query, mode: 'insensitive' } },
              { senderName: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        recipients: {
          where: {
            userId,
            userType,
          },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return messages.map(message => ({
      ...message,
      isRead: message.recipients.length > 0 ? !!message.recipients[0].readAt : false,
      isSent: message.senderId === userId,
    }));
  } catch (error) {
    console.error("Error searching messages:", error);
    throw error;
  }
}

// Helper functions
async function getUserInfo(userId: string, userType: UserType) {
  switch (userType) {
    case UserType.ADMIN:
      return await prisma.admin.findUnique({
        where: { id: userId },
        select: { username: true, id: true },
      }).then(user => user ? { ...user, name: 'Admin', surname: 'User' } : null);
    
    case UserType.TEACHER:
      return await prisma.teacher.findUnique({
        where: { id: userId },
        select: { name: true, surname: true, id: true },
      });
    
    case UserType.STUDENT:
      return await prisma.student.findUnique({
        where: { id: userId },
        select: { name: true, surname: true, id: true },
      });
    
    case UserType.PARENT:
      return await prisma.parent.findUnique({
        where: { id: userId },
        select: { name: true, surname: true, id: true },
      });
    
    default:
      return null;
  }
}

async function validateRecipients(recipients: Array<{ userId: string; userType: UserType; userName: string }>) {
  const validRecipients = [];
  
  for (const recipient of recipients) {
    const userInfo = await getUserInfo(recipient.userId, recipient.userType);
    if (userInfo) {
      validRecipients.push({
        ...recipient,
        userName: recipient.userName || `${userInfo.name} ${userInfo.surname}`,
      });
    }
  }
  
  return validRecipients;
}

async function getBroadcastRecipients(messageData: BroadcastMessageData) {
  const recipients = [];

  // Get all users of specified types
  if (messageData.targetUserTypes?.includes(UserType.ADMIN)) {
    const admins = await prisma.admin.findMany({
      select: { id: true, username: true },
    });
    recipients.push(...admins.map(admin => ({
      userId: admin.id,
      userType: UserType.ADMIN,
      userName: `Admin User`,
    })));
  }

  if (messageData.targetUserTypes?.includes(UserType.TEACHER)) {
    const teachers = await prisma.teacher.findMany({
      select: { id: true, name: true, surname: true },
    });
    recipients.push(...teachers.map(teacher => ({
      userId: teacher.id,
      userType: UserType.TEACHER,
      userName: `${teacher.name} ${teacher.surname}`,
    })));
  }

  if (messageData.targetUserTypes?.includes(UserType.STUDENT)) {
    const where: any = {};
    if (messageData.classIds?.length) {
      where.classId = { in: messageData.classIds };
    }
    if (messageData.gradeIds?.length) {
      where.gradeId = { in: messageData.gradeIds };
    }

    const students = await prisma.student.findMany({
      where,
      select: { id: true, name: true, surname: true },
    });
    recipients.push(...students.map(student => ({
      userId: student.id,
      userType: UserType.STUDENT,
      userName: `${student.name} ${student.surname}`,
    })));
  }

  if (messageData.targetUserTypes?.includes(UserType.PARENT)) {
    const where: any = {};
    if (messageData.classIds?.length || messageData.gradeIds?.length) {
      where.students = {
        some: {
          ...(messageData.classIds?.length && { classId: { in: messageData.classIds } }),
          ...(messageData.gradeIds?.length && { gradeId: { in: messageData.gradeIds } }),
        },
      };
    }

    const parents = await prisma.parent.findMany({
      where,
      select: { id: true, name: true, surname: true },
    });
    recipients.push(...parents.map(parent => ({
      userId: parent.id,
      userType: UserType.PARENT,
      userName: `${parent.name} ${parent.surname}`,
    })));
  }

  return recipients;
}

// Draft management
export async function saveDraft(
  userId: string,
  userType: UserType,
  draftData: {
    content: string;
    subject?: string;
    recipients: any[];
  }
) {
  try {
    // Find existing draft for this user
    const existingDraft = await prisma.messageDraft.findFirst({
      where: { userId, userType },
    });

    let draft;
    if (existingDraft) {
      // Update existing draft
      draft = await prisma.messageDraft.update({
        where: { id: existingDraft.id },
        data: {
          content: draftData.content,
          subject: draftData.subject,
          recipients: draftData.recipients,
        },
      });
    } else {
      // Create new draft
      draft = await prisma.messageDraft.create({
        data: {
          userId,
          userType,
          content: draftData.content,
          subject: draftData.subject,
          recipients: draftData.recipients,
        },
      });
    }

    return draft;
  } catch (error) {
    console.error("Error saving draft:", error);
    throw error;
  }
}

export async function getDraft(userId: string, userType: UserType) {
  try {
    const draft = await prisma.messageDraft.findFirst({
      where: { userId, userType },
    });

    return draft;
  } catch (error) {
    console.error("Error getting draft:", error);
    return null;
  }
}

export async function deleteDraft(userId: string, userType: UserType) {
  try {
    const draft = await prisma.messageDraft.findFirst({
      where: { userId, userType },
    });

    if (draft) {
      await prisma.messageDraft.delete({
        where: { id: draft.id },
      });
    }
  } catch (error) {
    console.error("Error deleting draft:", error);
    throw error;
  }
}
