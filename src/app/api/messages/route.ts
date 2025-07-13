import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { 
  getMessages, 
  sendMessage, 
  markAsRead, 
  deleteMessage, 
  broadcastMessage, 
  getUnreadCount, 
  searchMessages 
} from "@/lib/messaging-service";
import { UserType, MessageType, MessagePriority } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const messageType = searchParams.get('messageType') as MessageType || undefined;
    const priority = searchParams.get('priority') as MessagePriority || undefined;
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const action = searchParams.get('action');

    // Handle different actions
    if (action === 'unread-count') {
      const count = await getUnreadCount(session.userId, session.userType);
      return NextResponse.json({ count });
    }

    if (action === 'search' && search) {
      const messages = await searchMessages(
        session.userId,
        session.userType,
        search,
        limit
      );
      return NextResponse.json(messages);
    }

    // Get messages
    const messages = await getMessages({
      userId: session.userId,
      userType: session.userType,
      messageType,
      priority,
      unreadOnly,
      limit,
      offset,
    });

    // Format messages for frontend
    const formattedMessages = messages.map((message) => ({
      id: message.id,
      sender: message.senderName,
      recipient: message.recipients.map(r => r.userName).join(', ') || 'Multiple Recipients',
      subject: message.subject || 'No Subject',
      content: message.content,
      date: message.createdAt.toISOString().split('T')[0],
      status: message.isRead ? 'read' : 'unread',
      priority: message.priority.toLowerCase(),
      messageType: message.messageType,
      attachments: message.attachments || [],
      replyCount: message._count?.replies || 0,
      isSent: message.isSent,
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'send':
        const messageId = await sendMessage(session.userId, session.userType, {
          content: data.content,
          subject: data.subject,
          messageType: data.messageType || MessageType.DIRECT,
          priority: data.priority || MessagePriority.NORMAL,
          recipients: data.recipients,
          attachments: data.attachments,
        });
        return NextResponse.json({ messageId, success: true });

      case 'broadcast':
        const broadcastId = await broadcastMessage(
          session.userId,
          session.userType,
          {
            content: data.content,
            subject: data.subject,
            priority: data.priority || MessagePriority.NORMAL,
            targetUserTypes: data.targetUserTypes,
            classIds: data.classIds,
            gradeIds: data.gradeIds,
          }
        );
        return NextResponse.json({ messageId: broadcastId, success: true });

      case 'mark-read':
        await markAsRead(data.messageId, session.userId, session.userType);
        return NextResponse.json({ success: true });

      case 'delete':
        await deleteMessage(data.messageId, session.userId, session.userType);
        return NextResponse.json({ success: true });

      default:
        return new NextResponse("Invalid action", { status: 400 });
    }
  } catch (error) {
    console.error("Error handling message action:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
