import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getMessageById, markAsRead } from "@/lib/messaging-service";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const messageId = params.id;

    const message = await getMessageById(messageId, session.userId, session.userType);

    // Auto-mark as read when viewing
    if (!message.isRead && !message.isSent) {
      await markAsRead(messageId, session.userId, session.userType);
    }

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error fetching message:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
