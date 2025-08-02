import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";
import AnnouncementsClient from "./AnnouncementsClient";

const Announcements = async () => {
  // Get authenticated user
  const user = await getAuthUser();
  
  let data: any[] = [];
  
  try {
    if (!user || user.userType === UserType.ADMIN) {
      // Admin or no user - show all announcements
      data = await prisma.announcement.findMany({
        take: 3,
        orderBy: { date: "desc" },
      });
    } else {
      // Role-based filtering
      const roleConditions = {
        [UserType.TEACHER]: {
          OR: [
            { classId: null }, // Global announcements
            { class: { lessons: { some: { teacherId: user.id } } } }
          ]
        },
        [UserType.STUDENT]: {
          OR: [
            { classId: null }, // Global announcements
            { class: { students: { some: { id: user.id } } } }
          ]
        },
        [UserType.PARENT]: {
          OR: [
            { classId: null }, // Global announcements
            { class: { students: { some: { parentId: user.id } } } }
          ]
        },
      };

      data = await prisma.announcement.findMany({
        take: 3,
        orderBy: { date: "desc" },
        where: roleConditions[user.userType] || {},
      });
    }
  } catch (error) {
    console.error('Error fetching announcements:', error);
    data = [];
  }

  return <AnnouncementsClient announcements={data} />;
};

export default Announcements;
