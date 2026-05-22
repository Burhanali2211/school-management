import Announcements from "@/components/Announcements";
import AttendanceChart from "@/components/AttendanceChart";
import CountChart from "@/components/CountChart";
import FinanceChart from "@/components/FinanceChart";
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
    redirect("/sign-in");
  }
  return (
    <div className="space-y-8">
      {/* DASHBOARD HEADER */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-primary-100 text-lg">Welcome back! Here's what's happening at your school today.</p>
      </div>
      
      {/* USER CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="user-cards">
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
              <h2 className="text-lg font-semibold mb-4 text-primary-900">Students (Boys/Girls)</h2>
              <CountChart boys={550} girls={450} />
            </div>
            {/* ATTENDANCE CHART */}
            <div className="lg:col-span-2 h-[450px] bg-gradient-to-br from-white to-accent-50/30 rounded-2xl p-6 shadow-soft border border-accent-100/50">
              <h2 className="text-lg font-semibold mb-4 text-accent-900">Weekly Attendance</h2>
              <AttendanceChart data={[
                { name: "Mon", present: 950, absent: 50 },
                { name: "Tue", present: 940, absent: 60 },
                { name: "Wed", present: 960, absent: 40 },
                { name: "Thu", present: 930, absent: 70 },
                { name: "Fri", present: 910, absent: 90 },
              ]} />
            </div>
          </div>

          {/* BOTTOM CHART */}
          <div className="h-[500px] bg-gradient-to-br from-white to-secondary-50/30 rounded-2xl p-6 shadow-soft border border-secondary-100/50">
            <h2 className="text-lg font-semibold mb-4 text-secondary-900">Finance Overview</h2>
            <FinanceChart data={[
              { name: "Jan", income: 120000, expense: 90000 },
              { name: "Feb", income: 130000, expense: 85000 },
              { name: "Mar", income: 125000, expense: 95000 },
              { name: "Apr", income: 140000, expense: 92000 },
              { name: "May", income: 135000, expense: 88000 },
              { name: "Jun", income: 150000, expense: 100000 },
              { name: "Jul", income: 110000, expense: 105000 },
              { name: "Aug", income: 160000, expense: 110000 },
              { name: "Sep", income: 145000, expense: 95000 },
              { name: "Oct", income: 155000, expense: 90000 },
              { name: "Nov", income: 130000, expense: 85000 },
              { name: "Dec", income: 140000, expense: 88000 },
            ]} />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-white to-neutral-50/30 rounded-2xl p-6 shadow-soft border border-neutral-100/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">Upcoming Events</h2>
              <span className="text-sm text-neutral-500 cursor-pointer">View All</span>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm border-l-4 border-l-primary-500">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-neutral-800">Annual Science Fair</h3>
                  <span className="text-xs text-neutral-500">10:00 AM - 2:00 PM</span>
                </div>
                <p className="text-sm text-neutral-600">Main Auditorium</p>
              </div>
              <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm border-l-4 border-l-accent-500">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-neutral-800">Staff Meeting</h3>
                  <span className="text-xs text-neutral-500">3:30 PM - 5:00 PM</span>
                </div>
                <p className="text-sm text-neutral-600">Conference Room A</p>
              </div>
              <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm border-l-4 border-l-secondary-500">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-neutral-800">Parent-Teacher Conference</h3>
                  <span className="text-xs text-neutral-500">Tomorrow</span>
                </div>
                <p className="text-sm text-neutral-600">Respective Classrooms</p>
              </div>
            </div>
          </div>
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
