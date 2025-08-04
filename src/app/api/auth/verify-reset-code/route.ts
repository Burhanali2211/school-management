import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: "Invalid verification code format" },
        { status: 400 }
      );
    }

    // For demo purposes, accept "123456" as valid code
    // In a real app, you'd verify against stored codes with expiration
    if (code !== "123456") {
      return NextResponse.json(
        { error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    // Generate a temporary reset token
    const resetToken = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);

    return NextResponse.json({
      message: "Verification code verified successfully",
      resetToken: resetToken,
      success: true
    });

  } catch (error) {
    console.error("Verify reset code error:", error);
    return NextResponse.json(
      { error: "An error occurred while verifying the code" },
      { status: 500 }
    );
  }
}