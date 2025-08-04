import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import EventCalendar from "@/components/EventCalendar";
import { Card } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { requireStudent } from "@/lib/auth";
import { redirect } from "next/navigation";
import StudentPageClient from "./StudentPageClient";

const StudentPage = async () => {
  try {
    const user = await requireStudent();
    
    let classItem;
    try {
      classItem = await prisma.class.findMany({
        where: {
          students: { some: { id: user.id } },
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
  } catch (error) {
    redirect("/sign-in");
  }
};

export default StudentPage;
