"use client";

import Announcements from "@/components/Announcements";

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
            <div className="flex flex-col gap-4 mt-4">
              <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-800">English Literature</h3>
                  <p className="text-sm text-neutral-600">Mr. Roberts | Room 301</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-medium text-neutral-800">08:00 AM - 08:45 AM</span>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-1">Current</span>
                </div>
              </div>
              
              <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-800">Mathematics</h3>
                  <p className="text-sm text-neutral-600">Mrs. Davis | Room 204</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-medium text-neutral-800">09:00 AM - 09:45 AM</span>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mt-1">Next</span>
                </div>
              </div>

              <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-800">Biology</h3>
                  <p className="text-sm text-neutral-600">Dr. Wilson | Science Lab 1</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-medium text-neutral-800">10:00 AM - 10:45 AM</span>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mt-1">Later</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* SIDEBAR - Takes 1/3 width */}
        <div className="space-y-8">
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Upcoming Events</h3>
              <span className="text-sm text-neutral-500 cursor-pointer">View All</span>
            </div>
            <div className="space-y-4">
              <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm border-l-4 border-l-primary-500">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-neutral-800">Science Fair Meeting</h4>
                  <span className="text-xs text-neutral-500">Tomorrow 2 PM</span>
                </div>
                <p className="text-sm text-neutral-600">Library</p>
              </div>
            </div>
          </div>
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default StudentPageClient;