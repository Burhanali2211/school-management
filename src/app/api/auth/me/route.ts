import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getUserPreferences } from "@/lib/auth-service";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user preferences
    const preferences = await getUserPreferences(user.id, user.userType);

    return NextResponse.json({
      user,
      preferences,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}
