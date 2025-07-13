import prisma from "@/lib/prisma";
import BigCalendar from "./BigCalender";
import { adjustScheduleToCurrentWeek } from "@/lib/utils";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  let dataRes = [];
  
  try {
    dataRes = await prisma.lesson.findMany({
      where: {
        ...(type === "teacherId"
          ? { teacherId: id as string }
          : { classId: id as number }),
      },
    });
  } catch (error) {
    console.log("Database not configured, using demo data");
    // Return demo lesson data
    dataRes = [
      {
        name: "Demo Math Lesson",
        startTime: new Date(2024, 0, 1, 9, 0),
        endTime: new Date(2024, 0, 1, 10, 0),
      },
      {
        name: "Demo Science Lesson",
        startTime: new Date(2024, 0, 2, 10, 0),
        endTime: new Date(2024, 0, 2, 11, 0),
      },
    ];
  }

  const data = dataRes.map((lesson) => ({
    title: lesson.name,
    start: lesson.startTime,
    end: lesson.endTime,
  }));

  const schedule = adjustScheduleToCurrentWeek(data);

  return (
    <div className="">
      <BigCalendar data={schedule} />
    </div>
  );
};

export default BigCalendarContainer;
