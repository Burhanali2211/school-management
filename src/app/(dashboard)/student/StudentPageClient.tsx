"use client";

import Announcements from "@/components/Announcements";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalendar";
import { Card } from "@/components/ui/card";
import { Calendar, GraduationCap } from "lucide-react";

interface StudentPageClientProps {
  studentClass: {
    id: string | number;
    name: string;
  };
}

const StudentPageClient = ({ studentClass }: StudentPageClientProps) => {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <GraduationCap className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Student Dashboard</h1>
          <p className="text-secondary-500 text-sm">Welcome back! Here's your schedule and updates</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* SCHEDULE - Takes 2/3 width */}
        <div className="xl:col-span-2">
          <Card className="h-full" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-secondary-900">Class Schedule</h2>
                <p className="text-secondary-500 text-sm">{studentClass.name}</p>
              </div>
            </div>
            <BigCalendarContainer type="classId" id={studentClass.id} />
          </Card>
        </div>

        {/* SIDEBAR - Takes 1/3 width */}
        <div className="space-y-8">
          <EventCalendar />
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default StudentPageClient;