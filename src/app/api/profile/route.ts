import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Return the user profile
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, email, phone, department, address } = body;

    if (!name || !email) {
      return new NextResponse("Name and email are required", { status: 400 });
    }

    // TODO: Update the user profile based on user type
    // For now, return success without actual update
    return NextResponse.json({
      message: "Profile update functionality not yet implemented",
      data: { name, email, phone, department, address }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
