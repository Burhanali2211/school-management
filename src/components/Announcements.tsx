import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";
import { BellIcon } from "lucide-react";
import Card from "@/components/ui/card";

const Announcements = async () => {
  // Get authenticated user
  const user = await getAuthUser();
  
  let data;
  
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

  return (
    <Card className="h-fit">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-primary-500" />
          <h1 className="text-xl font-semibold text-secondary-900">Announcements</h1>
        </div>
        <span className="text-sm text-primary-500 font-medium">
          View All
        </span>
      </div>
      
      <div className="space-y-4">
        {data.length === 0 ? (
          <div className="text-center py-8 text-secondary-500">
            <BellIcon className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
            <p>No announcements yet</p>
          </div>
        ) : (
          data.slice(0, 3).map((announcement, index) => {
            const bgColors = [
              'bg-gradient-to-r from-blue-50 to-blue-100',
              'bg-gradient-to-r from-purple-50 to-purple-100',
              'bg-gradient-to-r from-green-50 to-green-100',
            ];
            
            return (
              <div key={announcement.id} className={`${bgColors[index]} rounded-xl p-4 border border-opacity-20`}>
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-secondary-900 mb-2">{announcement.title}</h3>
                  <span className="text-xs text-secondary-500 bg-white rounded-full px-2 py-1">
                    {new Intl.DateTimeFormat("en-GB").format(announcement.date)}
                  </span>
                </div>
                <p className="text-sm text-secondary-600 line-clamp-2">{announcement.description}</p>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default Announcements;
