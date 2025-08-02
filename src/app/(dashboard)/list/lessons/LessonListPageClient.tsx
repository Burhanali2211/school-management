"use client";

import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import TableSearch from "@/components/TableSearch";
import ListPageActions from "@/components/ui/list-page-actions";
import { Card } from "@/components/ui/card";
import { Class, Lesson, Subject, Teacher } from "@prisma/client";
import { BookOpen } from "lucide-react";

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
  const columns = [
    {
      header: "Subject Name",
      accessor: "name",
    },
    {
      header: "Class",
      accessor: "class",
    },
    {
      header: "Teacher",
      accessor: "teacher",
      className: "hidden md:table-cell",
    },
    ...(isAdmin
      ? [
          {
            header: "Actions",
            accessor: "action",
          },
        ]
      : []),
  ];

  const renderRow = (item: LessonList) => (
    <TableRow key={item.id}>
      <TableCell className="flex items-center gap-4">{item.subject.name}</TableCell>
      <TableCell>{item.class.name}</TableCell>
      <TableCell className="hidden md:table-cell">
        {item.teacher.name + " " + item.teacher.surname}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <FormContainer table="lesson" type="update" data={item} />
              <FormContainer table="lesson" type="delete" id={item.id} />
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Card className="space-y-6" fullWidth fullHeight background="transparent" border={false} shadow="none" padding="lg">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">All Lessons</h1>
            <p className="text-secondary-500 text-sm">Manage class schedules and lesson plans</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <TableSearch />
          <ListPageActions
            filterText="Filter"
            sortText="Sort"
            filterAction="Filter lessons"
            sortAction="Sort lessons"
          />
          {isAdmin && <FormContainer table="lesson" type="create" />}
        </div>
      </div>
      {/* LIST */}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.accessor} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map(renderRow)}
        </TableBody>
      </Table>
      {/* PAGINATION */}
      <Pagination page={page} count={count} />
    </Card>
  );
};

export default LessonListPageClient;