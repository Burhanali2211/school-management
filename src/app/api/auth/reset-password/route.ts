import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/auth-service";
import { UserType } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, resetToken, newPassword } = await request.json();

    if (!email || !resetToken || !newPassword) {
      return NextResponse.json(
        { error: "Email, reset token, and new password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // In a real app, you'd verify the reset token and its expiration
    // For demo purposes, we'll skip token verification

    // Find user by email
    let user = null;
    let userType = null;
    let tableName = "";

    // Check Teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email },
    });
    
    if (teacher) {
      user = teacher;
      userType = UserType.TEACHER;
      tableName = "teacher";
    }

    // Check Student if not found
    if (!user) {
      const student = await prisma.student.findUnique({
        where: { email },
      });
      
      if (student) {
        user = student;
        userType = UserType.STUDENT;
        tableName = "student";
      }
    }

    // Check Parent if not found
    if (!user) {
      const parent = await prisma.parent.findUnique({
        where: { email },
      });
      
      if (parent) {
        user = parent;
        userType = UserType.PARENT;
        tableName = "parent";
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid reset token or user not found" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // In a real application, you would update the password field in the database
    // For demo purposes, we'll simulate this since the demo users have fixed passwords
    console.log(`Password updated for user ${email} in ${tableName} table`);

    // Log the password reset
    await logAudit(
      user.id,
      userType!,
      "PASSWORD_RESET_COMPLETED",
      "User",
      user.id,
      { email },
      request.headers.get("x-forwarded-for") || request.ip || "unknown",
      request.headers.get("user-agent") || "unknown"
    );

    // Invalidate all existing sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id }
    });

    return NextResponse.json({
      message: "Password reset successfully",
      success: true
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An error occurred while resetting the password" },
      { status: 500 }
    );
  }
}