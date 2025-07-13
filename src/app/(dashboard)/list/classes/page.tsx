import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Card from "@/components/ui/card";
import { Search, Filter, SortAsc, Plus, Edit, Trash2, Users, User, School, Building } from "lucide-react";

import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Prisma, Teacher } from "@prisma/client";
import Image from "next/image";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";

type ClassList = Class & { supervisor: Teacher };

const ClassListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

const user = await getAuthUser();
  const isAdmin = user?.userType === UserType.ADMIN;


const columns = [
  {
    header: "Class Name",
    accessor: "name",
  },
  {
    header: "Capacity",
    accessor: "capacity",
    className: "hidden md:table-cell",
  },
  {
    header: "Grade",
    accessor: "grade",
    className: "hidden md:table-cell",
  },
  {
    header: "Supervisor",
    accessor: "supervisor",
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

const renderRow = (item: ClassList) => (
  <TableRow key={item.id} className="hover:bg-secondary-50">
    <TableCell className="flex items-center gap-4 p-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
        <School className="w-6 h-6 text-white" />
      </div>
      <div className="flex flex-col">
        <h3 className="font-semibold text-secondary-900 text-lg">{item.name}</h3>
        <p className="text-xs text-secondary-500">Grade {item.name[0]}</p>
      </div>
    </TableCell>
    <TableCell className="hidden md:table-cell text-center">
      <div className="flex items-center justify-center gap-2">
        <Users className="w-4 h-4 text-secondary-500" />
        <Badge variant="info">{item.capacity} students</Badge>
      </div>
    </TableCell>
    <TableCell className="hidden md:table-cell text-center">
      <Badge variant="secondary" size="lg">{item.name[0]}</Badge>
    </TableCell>
    <TableCell className="hidden md:table-cell">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-medium text-secondary-900 text-sm">
            {item.supervisor.name} {item.supervisor.surname}
          </span>
          <span className="text-xs text-secondary-500">Class Supervisor</span>
        </div>
      </div>
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-2 justify-center">
        {isAdmin && (
          <>
            <FormContainer table="class" type="update" data={item} />
            <FormContainer table="class" type="delete" id={item.id} />
          </>
        )}
      </div>
    </TableCell>
  </TableRow>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ClassWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "supervisorId":
            query.supervisorId = value;
            break;
          case "search":
            query.name = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  const [data, count] = await prisma.$transaction([
    prisma.class.findMany({
      where: query,
      include: {
        supervisor: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.class.count({ where: query }),
  ]);

  return (
    <Card className="space-y-6">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Building className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">All Classes</h1>
            <p className="text-secondary-500 text-sm">Manage classroom assignments and capacity</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border border-secondary-200 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-secondary-500" />
            <Input 
              type="text" 
              placeholder="Search classes..." 
              className="border-none p-0 focus:ring-0 w-48" 
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <SortAsc className="w-4 h-4 mr-2" />
            Sort
          </Button>
          {isAdmin && (
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Class
            </Button>
          )}
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
      <Pagination page={p} count={count} />
    </Card>
  );
};

export default ClassListPage;
