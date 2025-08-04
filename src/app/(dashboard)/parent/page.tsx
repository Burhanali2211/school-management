import Announcements from "@/components/Announcements";
import { Card } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { requireParent } from "@/lib/auth";
import { redirect } from "next/navigation";
import ParentPageClient from "./ParentPageClient";

const ParentPage = async () => {
  try {
    const user = await requireParent();
    
    // Validate that user.id exists
    if (!user.id) {
      redirect("/sign-in");
    }
    
    let students;
    try {
      students = await prisma.student.findMany({
        where: {
          parentId: user.id,
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
  } catch (error) {
    redirect("/sign-in");
  }
};

export default ParentPage;
