import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth-service";

export async function POST(request: NextRequest) {
  try {
    const { username, password, userType, deviceInfo } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Get IP and user agent for audit logging
    const ipAddress = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     request.ip || 
                     "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    // Enhanced device info logging
    const enhancedDeviceInfo = {
      ip: ipAddress,
      userAgent,
      device: deviceInfo?.device || "Unknown",
      browser: deviceInfo?.browser || "Unknown",
      timestamp: new Date().toISOString()
    };

    const result = await authenticateUser(username, password, ipAddress, userAgent, userType);

    if (!result) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Enhanced response with security info
    const response = NextResponse.json({
      user: result.user,
      token: result.token,
      security: {
        sessionId: result.sessionId,
        expiresAt: result.expiresAt,
        deviceInfo: enhancedDeviceInfo
      }
    });

    // Set secure session cookie
    response.cookies.set("session-token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
