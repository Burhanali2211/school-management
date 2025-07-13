import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany();
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}