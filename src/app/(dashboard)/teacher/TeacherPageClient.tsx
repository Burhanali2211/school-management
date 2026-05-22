"use client";

import Announcements from "@/components/Announcements";
import { Card } from "@/components/ui/card";
import { Calendar, Users } from "lucide-react";

interface TeacherPageClientProps {
  userId: string;
}

const TeacherPageClient = ({ userId }: TeacherPageClientProps) => {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Users className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Teacher Dashboard</h1>
          <p className="text-secondary-500 text-sm">Manage your classes and schedule</p>
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
                <h2 className="text-xl font-semibold text-secondary-900">Teaching Schedule</h2>
                <p className="text-secondary-500 text-sm">Your classes and lessons</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-800">Grade 10 Mathematics</h3>
                  <p className="text-sm text-neutral-600">Room 204</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-medium text-neutral-800">09:00 AM - 09:45 AM</span>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full mt-1">Upcoming</span>
                </div>
              </div>
              
              <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-800">Grade 11 Physics</h3>
                  <p className="text-sm text-neutral-600">Science Lab 2</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-medium text-neutral-800">10:00 AM - 11:30 AM</span>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full mt-1">Next</span>
                </div>
              </div>

              <div className="p-4 border border-neutral-200 rounded-xl bg-white shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-neutral-800">Grade 9 Mathematics</h3>
                  <p className="text-sm text-neutral-600">Room 105</p>
                </div>
                <div className="text-right">
                  <span className="block text-sm font-medium text-neutral-800">12:30 PM - 01:15 PM</span>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full mt-1">Later</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* SIDEBAR - Takes 1/3 width */}
        <div className="space-y-8">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default TeacherPageClient;