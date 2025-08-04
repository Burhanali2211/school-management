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

    // Get user details based on user type
    let userDetails = null;

    switch (session.userType) {
      case "ADMIN":
        userDetails = await prisma.admin.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            username: true,
          }
        });
        if (userDetails) {
          userDetails = {
            ...userDetails,
            name: "Admin",
            surname: "User",
            email: `${userDetails.username}@admin.local`,
          };
        }
        break;

      case "TEACHER":
        userDetails = await prisma.teacher.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            email: true,
          }
        });
        break;

      case "STUDENT":
        userDetails = await prisma.student.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            email: true,
          }
        });
        break;

      case "PARENT":
        userDetails = await prisma.parent.findUnique({
          where: { id: session.userId },
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            email: true,
          }
        });
        break;
    }

    if (!userDetails) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get current session info
    const currentSession = await prisma.session.findUnique({
      where: { id: session.sessionId },
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
        expiresAt: true,
      },
      orderBy: { lastActive: 'desc' }
    });

    return NextResponse.json({
      user: {
        ...userDetails,
        userType: session.userType,
      },
      currentSession,
      activeSessions,
      sessionCount: activeSessions.length
    });

  } catch (error) {
    console.error("Get user info error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching user information" },
      { status: 500 }
    );
  }
}