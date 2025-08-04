"use client";

import Announcements from "@/components/Announcements";

import { Card } from "@/components/ui/card";
import { Calendar, Heart, Users } from "lucide-react";

interface Student {
  id: string;
  name: string;
  surname: string;
  classId: string | number;
  parentId: string;
}

interface ParentPageClientProps {
  students: Student[];
}

const ParentPageClient = ({ students }: ParentPageClientProps) => {
  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-pink-100 rounded-lg">
          <Heart className="w-6 h-6 text-pink-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Parent Dashboard</h1>
          <p className="text-secondary-500 text-sm">Monitor your children's academic progress</p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* SCHEDULES - Takes 2/3 width */}
        <div className="xl:col-span-2 space-y-6">
          {students.length > 0 ? (
            students.map((student) => (
              <Card key={student.id} className="h-full" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-secondary-900">
                      {student.name} {student.surname}'s Schedule
                    </h2>
                    <p className="text-secondary-500 text-sm">Class schedule and activities</p>
                  </div>
                </div>
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Calendar</h3>
                  <p className="text-neutral-600">Calendar component removed for performance optimization.</p>
                </div>
              </Card>
            ))
          ) : (
            <Card className="h-full" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-neutral-100 rounded-lg">
                  <Users className="w-5 h-5 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-secondary-900">No Students Found</h2>
                  <p className="text-secondary-500 text-sm">No students are associated with this parent account</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* SIDEBAR - Takes 1/3 width */}
        <div className="space-y-8">
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default ParentPageClient;