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
    <div className="space-y-8">
      {/* USER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <UserCard type="admin" />
        <UserCard type="teacher" />
        <UserCard type="student" />
        <UserCard type="parent" />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN - CHARTS */}
        <div className="lg:col-span-2 space-y-8">
          {/* MIDDLE CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COUNT CHART */}
            <div className="lg:col-span-1 h-[450px] bg-gradient-to-br from-white to-primary-50/30 rounded-2xl p-6 shadow-soft border border-primary-100/50">
              <h2 className="text-lg font-semibold mb-4 text-primary-900">Count Chart</h2>
              <p className="text-primary-600">Chart temporarily disabled</p>
            </div>
            {/* ATTENDANCE CHART */}
            <div className="lg:col-span-2 h-[450px] bg-gradient-to-br from-white to-accent-50/30 rounded-2xl p-6 shadow-soft border border-accent-100/50">
              <h2 className="text-lg font-semibold mb-4 text-accent-900">Attendance Chart</h2>
              <p className="text-accent-600">Chart temporarily disabled</p>
            </div>
          </div>

          {/* BOTTOM CHART */}
          <div className="h-[500px] bg-gradient-to-br from-white to-secondary-50/30 rounded-2xl p-6 shadow-soft border border-secondary-100/50">
            <h2 className="text-lg font-semibold mb-4 text-secondary-900">Finance Chart</h2>
            <p className="text-secondary-600">Chart temporarily disabled</p>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-white to-neutral-50/30 rounded-2xl p-6 shadow-soft border border-neutral-100/50">
            <h2 className="text-lg font-semibold mb-4 text-neutral-900">Calendar</h2>
            <p className="text-neutral-600">Calendar temporarily disabled</p>
          </div>
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
