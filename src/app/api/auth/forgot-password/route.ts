import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAudit } from "@/lib/auth-service";
import { UserType } from "@prisma/client";

// In a real application, you would use a proper email service
// For demo purposes, we'll simulate email sending
const simulateEmailSending = async (email: string, code: string) => {
  console.log(`Simulated email sent to ${email} with code: ${code}`);
  return true;
};

// Generate a 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Find user by email in all user tables
    let user = null;
    let userType = null;

    // Check Teacher
    const teacher = await prisma.teacher.findUnique({
      where: { email },
    });
    
    if (teacher) {
      user = teacher;
      userType = UserType.TEACHER;
    }

    // Check Student if not found
    if (!user) {
      const student = await prisma.student.findUnique({
        where: { email },
      });
      
      if (student) {
        user = student;
        userType = UserType.STUDENT;
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
      }
    }

    // Always return success to prevent email enumeration attacks
    // In a real app, only send code if user exists
    if (user) {
      const verificationCode = generateVerificationCode();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store the verification code
      // In a real app, you'd store this in a password_reset_tokens table
      // For demo, we'll use a simple in-memory store or simulate
      console.log(`Password reset code for ${email}: ${verificationCode}`);

      // Log the password reset request
      await logAudit(
        user.id,
        userType!,
        "PASSWORD_RESET_REQUESTED",
        "User",
        user.id,
        { email },
        request.headers.get("x-forwarded-for") || request.ip || "unknown",
        request.headers.get("user-agent") || "unknown"
      );

      // Simulate sending email
      await simulateEmailSending(email, verificationCode);
    }

    return NextResponse.json({
      message: "If an account with this email exists, a verification code has been sent.",
      success: true
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}