import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser, requireAuth, requireUserType } from "@/lib/auth-utils";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const attendances = await prisma.attendance.findMany({
      include: {
        student: true,
        lesson: {
          include: {
            class: true,
            subject: true,
          },
        },
      },
    });

    const formattedAttendances = attendances.map((attendance) => ({
      id: attendance.id,
      studentId: attendance.studentId,
      studentName: `${attendance.student.name} ${attendance.student.surname}`,
      className: attendance.lesson.class.name,
      date: attendance.date.toISOString().split('T')[0],
      status: attendance.present ? 'present' : 'absent',
      subject: attendance.lesson.subject.name,
    }));

    return NextResponse.json(formattedAttendances);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only admins and teachers can create attendance records
    if (!['ADMIN', 'TEACHER'].includes(user.userType)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { studentId, classId, subjectId, date, status } = body;

    if (!studentId || !classId || !subjectId || !date || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        classId,
        subjectId,
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    const newAttendance = await prisma.attendance.create({
      data: {
        studentId,
        lessonId: lesson.id,
        date: new Date(date),
        present: status === 'present',
      },
    });

    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    console.error("Error creating attendance:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only admins and teachers can update attendance records
    if (!['ADMIN', 'TEACHER'].includes(user.userType)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const body = await req.json();
    const { id, studentId, classId, subjectId, date, status } = body;

    if (!id || !studentId || !classId || !subjectId || !date || !status) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const lesson = await prisma.lesson.findFirst({
      where: {
        classId,
        subjectId,
      },
    });

    if (!lesson) {
      return new NextResponse("Lesson not found", { status: 404 });
    }

    const updatedAttendance = await prisma.attendance.update({
      where: { id: parseInt(id) },
      data: {
        studentId,
        lessonId: lesson.id,
        date: new Date(date),
        present: status === 'present',
      },
    });

    return NextResponse.json(updatedAttendance);
  } catch (error) {
    console.error("Error updating attendance:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Only admins can delete attendance records
    if (user.userType !== 'ADMIN') {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    await prisma.attendance.delete({
      where: { id: parseInt(id) },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}