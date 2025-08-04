import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const grades = await prisma.grade.findMany({
      select: {
        id: true,
        name: true,
        level: true,
      },
      orderBy: {
        level: "asc",
      },
    });

    return NextResponse.json(grades);
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
} 