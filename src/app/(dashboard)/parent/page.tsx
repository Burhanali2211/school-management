import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";


const ParentPage = async () => {
  let currentUserId = "parent1"; // Default for demo
  
  try {
    const { userId } = auth();
    currentUserId = userId || "parent1";
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

  return (
    <div className="flex-1 p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {students.length > 0 ? (
          students.map((student) => (
            <div className="mb-6" key={student.id}>
              <div className="h-full bg-white p-4 rounded-md">
                <h1 className="text-xl font-semibold mb-4">
                  Schedule ({student.name + " " + student.surname})
                </h1>
                <BigCalendarContainer type="classId" id={student.classId} />
              </div>
            </div>
          ))
        ) : (
          <div className="h-full bg-white p-4 rounded-md">
            <h1 className="text-xl font-semibold mb-4">Schedule</h1>
            <p className="text-gray-500">No students found for this parent account.</p>
          </div>
        )}
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <Announcements />
      </div>
    </div>
  );
};

export default ParentPage;
