import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserType } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    
    const userType = searchParams.get('userType') as UserType;
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');

    let users = [];

    switch (userType) {
      case UserType.ADMIN:
        const admins = await prisma.admin.findMany({
          where: search ? {
            username: {
              contains: search,
              mode: 'insensitive',
            },
          } : {},
          select: {
            id: true,
            username: true,
          },
          take: limit,
        });
        users = admins.map(admin => ({
          id: admin.id,
          name: 'Admin User',
          username: admin.username,
          userType: UserType.ADMIN,
          displayName: `Admin User (${admin.username})`,
        }));
        break;

      case UserType.TEACHER:
        const teachers = await prisma.teacher.findMany({
          where: search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { surname: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } },
            ],
          } : {},
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            email: true,
          },
          take: limit,
        });
        users = teachers.map(teacher => ({
          id: teacher.id,
          name: `${teacher.name} ${teacher.surname}`,
          username: teacher.username,
          email: teacher.email,
          userType: UserType.TEACHER,
          displayName: `${teacher.name} ${teacher.surname} (${teacher.username})`,
        }));
        break;

      case UserType.STUDENT:
        const students = await prisma.student.findMany({
          where: search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { surname: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } },
            ],
          } : {},
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            email: true,
            class: {
              select: {
                name: true,
              },
            },
          },
          take: limit,
        });
        users = students.map(student => ({
          id: student.id,
          name: `${student.name} ${student.surname}`,
          username: student.username,
          email: student.email,
          userType: UserType.STUDENT,
          displayName: `${student.name} ${student.surname} (${student.class.name})`,
        }));
        break;

      case UserType.PARENT:
        const parents = await prisma.parent.findMany({
          where: search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { surname: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } },
            ],
          } : {},
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            email: true,
            students: {
              select: {
                name: true,
                surname: true,
              },
            },
          },
          take: limit,
        });
        users = parents.map(parent => ({
          id: parent.id,
          name: `${parent.name} ${parent.surname}`,
          username: parent.username,
          email: parent.email,
          userType: UserType.PARENT,
          displayName: `${parent.name} ${parent.surname} (Parent)`,
        }));
        break;

      default:
        // Get all users if no specific type requested
        const allUsers = await Promise.all([
          prisma.admin.findMany({
            select: { id: true, username: true },
            take: Math.floor(limit / 4),
          }),
          prisma.teacher.findMany({
            select: { id: true, name: true, surname: true, username: true },
            take: Math.floor(limit / 4),
          }),
          prisma.student.findMany({
            select: { id: true, name: true, surname: true, username: true },
            take: Math.floor(limit / 4),
          }),
          prisma.parent.findMany({
            select: { id: true, name: true, surname: true, username: true },
            take: Math.floor(limit / 4),
          }),
        ]);

        users = [
          ...allUsers[0].map(admin => ({
            id: admin.id,
            name: 'Admin User',
            username: admin.username,
            userType: UserType.ADMIN,
            displayName: `Admin User (${admin.username})`,
          })),
          ...allUsers[1].map(teacher => ({
            id: teacher.id,
            name: `${teacher.name} ${teacher.surname}`,
            username: teacher.username,
            userType: UserType.TEACHER,
            displayName: `${teacher.name} ${teacher.surname} (Teacher)`,
          })),
          ...allUsers[2].map(student => ({
            id: student.id,
            name: `${student.name} ${student.surname}`,
            username: student.username,
            userType: UserType.STUDENT,
            displayName: `${student.name} ${student.surname} (Student)`,
          })),
          ...allUsers[3].map(parent => ({
            id: parent.id,
            name: `${parent.name} ${parent.surname}`,
            username: parent.username,
            userType: UserType.PARENT,
            displayName: `${parent.name} ${parent.surname} (Parent)`,
          })),
        ];
        break;
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
