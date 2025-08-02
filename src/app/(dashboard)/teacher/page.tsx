import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import { Card } from "@/components/ui/card";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";
import TeacherPageClient from "./TeacherPageClient";

const TeacherPage = async () => {
  let userId = "teacher1"; // Default for demo

  try {
    const user = await getAuthUser();
    userId = user?.id || "teacher1";
  } catch (error) {
    console.log("Auth not configured, using demo mode");
  }
  
  return <TeacherPageClient userId={userId} />;
};

export default TeacherPage;
