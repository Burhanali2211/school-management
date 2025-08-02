import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { Card } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";
import ParentPageClient from "./ParentPageClient";

const ParentPage = async () => {
  let currentUserId = "parent1"; // Default for demo

  try {
    const user = await getAuthUser();
    currentUserId = user?.id || "parent1";
  } catch (error) {
    console.log("Auth not configured, using demo mode");
  }
  
  let students;
  try {
    students = await prisma.student.findMany({
      where: {
        parentId: currentUserId!,
      },
    });
  } catch (error) {
    console.log("Database not configured, using demo students");
    // Return demo students for demonstration
    students = [
      {
        id: "student1",
        name: "John",
        surname: "Doe",
        classId: 1,
        parentId: "parent1"
      },
      {
        id: "student2", 
        name: "Jane",
        surname: "Smith",
        classId: 2,
        parentId: "parent1"
      }
    ];
  }

  return <ParentPageClient students={students} />;
};

export default ParentPage;
