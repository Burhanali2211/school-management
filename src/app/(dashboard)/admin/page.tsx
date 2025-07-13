import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChartContainer from "@/components/FinanceChartContainer";
import UserCard from "@/components/UserCard";
import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

const AdminPage = async ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
  try {
    await requireAdmin();
  } catch (error) {
    redirect("/admin-login");
  }
  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-2/3 flex flex-col gap-8">
        {/* USER CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <UserCard type="admin" />
          <UserCard type="teacher" />
          <UserCard type="student" />
          <UserCard type="parent" />
        </div>
        {/* MIDDLE CHARTS */}
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* COUNT CHART */}
          <div className="w-full lg:w-1/3 h-[450px] bg-white rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Count Chart</h2>
            <p className="text-gray-500">Chart temporarily disabled</p>
          </div>
          {/* ATTENDANCE CHART */}
          <div className="w-full lg:w-2/3 h-[450px] bg-white rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-4">Attendance Chart</h2>
            <p className="text-gray-500">Chart temporarily disabled</p>
          </div>
        </div>
        {/* BOTTOM CHART */}
        <div className="w-full h-[500px] bg-white rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">Finance Chart</h2>
          <p className="text-gray-500">Chart temporarily disabled</p>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full lg:w-1/3 flex flex-col gap-8">
        <div className="bg-white p-4 rounded-md">
          <h2 className="text-lg font-semibold mb-4">Calendar</h2>
          <p className="text-gray-500">Calendar temporarily disabled</p>
        </div>
        <Announcements />
      </div>
    </div>
  );
};

export default AdminPage;
