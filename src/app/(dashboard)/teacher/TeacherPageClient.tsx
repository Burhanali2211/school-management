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
            <div className="flex items-center justify-center h-64 text-secondary-500">
              <p>Calendar component removed</p>
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