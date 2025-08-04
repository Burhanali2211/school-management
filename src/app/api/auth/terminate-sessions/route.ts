import { NextRequest, NextResponse } from "next/server";
import { validateSession, logAudit } from "@/lib/auth-service";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { sessionIds, terminateAll } = await request.json();

    if (terminateAll) {
      // Terminate all sessions except the current one
      const deleted = await prisma.session.deleteMany({
        where: { 
          userId: session.userId,
          id: { not: session.sessionId }
        }
      });

      // Log the action
      await logAudit(
        session.userId,
        session.userType,
        "TERMINATE_ALL_SESSIONS",
        "Session",
        undefined,
        { terminatedCount: deleted.count },
        request.headers.get("x-forwarded-for") || request.ip || "unknown",
        request.headers.get("user-agent") || "unknown"
      );

      return NextResponse.json({
        message: `Terminated ${deleted.count} sessions successfully`,
        terminatedCount: deleted.count
      });
    } else if (sessionIds && Array.isArray(sessionIds)) {
      // Terminate specific sessions
      const deleted = await prisma.session.deleteMany({
        where: { 
          userId: session.userId,
          id: { in: sessionIds, not: session.sessionId }
        }
      });

      // Log the action
      await logAudit(
        session.userId,
        session.userType,
        "TERMINATE_SESSIONS",
        "Session",
        undefined,
        { sessionIds, terminatedCount: deleted.count },
        request.headers.get("x-forwarded-for") || request.ip || "unknown",
        request.headers.get("user-agent") || "unknown"
      );

      return NextResponse.json({
        message: `Terminated ${deleted.count} sessions successfully`,
        terminatedCount: deleted.count
      });
    } else {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Terminate sessions error:", error);
    return NextResponse.json(
      { error: "An error occurred while terminating sessions" },
      { status: 500 }
    );
  }
}