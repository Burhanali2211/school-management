"use client";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import TableSearch from "@/components/TableSearch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Class, Lesson, Subject, Teacher } from "@prisma/client";
import { BookOpen, Clock, Users, Calendar } from "lucide-react";

type LessonList = Lesson & { subject: Subject } & { class: Class } & {
  teacher: Teacher;
};

interface LessonListPageClientProps {
  data: LessonList[];
  count: number;
  page: number;
  isAdmin: boolean;
}

const LessonListPageClient = ({ data, count, page, isAdmin }: LessonListPageClientProps) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lessons</h1>
            <p className="text-gray-600 text-sm">Manage class schedules and lesson plans</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TableSearch />
          {isAdmin && (
            <FormContainer table="lesson" type="create" />
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Lessons</p>
              <p className="text-2xl font-bold text-blue-900">{count}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Active Classes</p>
              <p className="text-2xl font-bold text-green-900">
                {new Set(data.map(lesson => lesson.classId)).size}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-purple-600 font-medium">This Week</p>
              <p className="text-2xl font-bold text-purple-900">
                {data.filter(lesson => {
                  const lessonDate = new Date(lesson.startTime);
                  const now = new Date();
                  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                  const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
                  return lessonDate >= weekStart && lessonDate <= weekEnd;
                }).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Lessons Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold text-gray-700">Subject</TableHead>
                <TableHead className="font-semibold text-gray-700">Class</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden md:table-cell">Teacher</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Schedule</TableHead>
                <TableHead className="font-semibold text-gray-700 hidden lg:table-cell">Time</TableHead>
                {isAdmin && (
                  <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((lesson) => (
                <TableRow key={lesson.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{lesson.subject.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {lesson.subject.name}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{lesson.class.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {lesson.teacher.name.charAt(0)}{lesson.teacher.surname.charAt(0)}
                        </span>
                      </div>
                      <span className="text-gray-900">
                        {lesson.teacher.name} {lesson.teacher.surname}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {formatDay(lesson.day)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      {formatTime(lesson.startTime)} - {formatTime(lesson.endTime)}
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <FormContainer table="lesson" type="update" data={lesson} />
                        <FormContainer table="lesson" type="delete" id={lesson.id} />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      <Pagination page={page} count={count} />
    </div>
  );
};

export default LessonListPageClient;