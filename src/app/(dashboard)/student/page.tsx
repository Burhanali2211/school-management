import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
import EventCalendar from "@/components/EventCalendar";
import { Card } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";
import StudentPageClient from "./StudentPageClient";

const StudentPage = async () => {
  let userId = "student1"; // Default for demo
  
  try {
    const user = await getAuthUser();
    userId = user?.id || "student1";
  } catch (error) {
    console.log("Auth not configured, using demo mode");
  }

  let classItem;
  try {
    classItem = await prisma.class.findMany({
      where: {
        students: { some: { id: userId } },
      },
    });
  } catch (error) {
    console.log("Database not configured, using demo class");
    // Return demo class for demonstration
    classItem = [{ id: 1, name: "Demo Class" }];
  }

  if (!classItem || classItem.length === 0) {
    // Use demo class
    classItem = [{ id: 1, name: "Demo Class" }];
  }

  const studentClass = classItem[0];

  return <StudentPageClient studentClass={studentClass} />;
};

export default StudentPage;
