import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    console.log("Test API: Starting...");
    
    // Test basic Prisma connection
    const studentCount = await prisma.student.count();
    console.log("Test API: Student count:", studentCount);
    
    return NextResponse.json({ 
      message: "Test successful", 
      studentCount 
    });
  } catch (error) {
    console.error("Test API: Error:", error);
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
} 