import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "@/lib/auth-service";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await validateSession();

    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get additional session information - use findFirst since userId is not unique
    const sessionData = await prisma.session.findFirst({
      where: { userId: session.userId },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastActive: true,
        expiresAt: true,
      }
    });

    // Get all active sessions for this user
    const activeSessions = await prisma.session.findMany({
      where: { 
        userId: session.userId,
        expiresAt: { gt: new Date() }
      },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastActive: true,
      },
      orderBy: { lastActive: 'desc' }
    });

    return NextResponse.json({
      user: {
        id: session.userId,
        userType: session.userType,
        username: session.username,
      },
      currentSession: sessionData,
      activeSessions: activeSessions,
      sessionCount: activeSessions.length
    });

  } catch (error) {
    console.error("Session info error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching session information" },
      { status: 500 }
    );
  }
}