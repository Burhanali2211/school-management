import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import BigCalendar from "@/components/BigCalender";
import EventCalendar from "@/components/EventCalendar";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";

const StudentPage = async () => {
  let userId = "student1"; // Default for demo
  
  try {
    const authResult = auth();
    userId = authResult.userId || "student1";
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

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Schedule ({studentClass.name})</h1>
          <BigCalendarContainer type="classId" id={studentClass.id} />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
