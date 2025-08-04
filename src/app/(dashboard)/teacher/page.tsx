import Announcements from "@/components/Announcements";
import { Card } from "@/components/ui/card";
import { requireTeacher } from "@/lib/auth";
import { redirect } from "next/navigation";
import TeacherPageClient from "./TeacherPageClient";

const TeacherPage = async () => {
  try {
    const user = await requireTeacher();
    return <TeacherPageClient userId={user.id} />;
  } catch (error) {
    redirect("/sign-in");
  }
};

export default TeacherPage;
