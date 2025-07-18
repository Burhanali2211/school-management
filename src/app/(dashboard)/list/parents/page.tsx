import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Parent, Prisma, Student } from "@prisma/client";
import Image from "next/image";
import Card from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { Filter, UserPlus, Users, Phone, MapPin, ArrowUpDown } from "lucide-react";

import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";

type ParentList = Parent & { students: Student[] };

const ParentListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

const user = await getAuthUser();
  const isAdmin = user?.userType === UserType.ADMIN;


const columns = [
  {
    header: "Info",
    accessor: "info",
  },
  {
    header: "Student Names",
    accessor: "students",
    className: "hidden md:table-cell",
  },
  {
    header: "Phone",
    accessor: "phone",
    className: "hidden lg:table-cell",
  },
  {
    header: "Address",
    accessor: "address",
    className: "hidden lg:table-cell",
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

const renderRow = (item: ParentList) => (
  <tr
    key={item.id}
    className="group border-b border-slate-200/60 text-sm hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200"
  >
    <td className="p-4">
      <div className="flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
          <Users className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-slate-500 truncate">
            {item?.email || "No email provided"}
          </p>
        </div>
      </div>
    </td>
    <td className="hidden md:table-cell p-4">
      <div className="flex flex-wrap gap-1">
        {item.students.length > 0 ? (
          item.students.map((student, index) => (
            <Badge key={student.id} variant="secondary" className="text-xs">
              {student.name}
            </Badge>
          ))
        ) : (
          <span className="text-slate-400 text-xs">No students</span>
        )}
      </div>
    </td>
    <td className="hidden lg:table-cell p-4">
      <div className="flex items-center gap-2 text-slate-600">
        <Phone className="w-4 h-4 text-slate-400" />
        <span className="text-sm">{item.phone || "N/A"}</span>
      </div>
    </td>
    <td className="hidden lg:table-cell p-4">
      <div className="flex items-center gap-2 text-slate-600">
        <MapPin className="w-4 h-4 text-slate-400" />
        <span className="text-sm truncate max-w-[150px]" title={item.address}>
          {item.address || "N/A"}
        </span>
      </div>
    </td>
    {isAdmin && (
      <td className="p-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <FormContainer table="parent" type="update" data={item} />
          <FormContainer table="parent" type="delete" id={item.id} />
        </div>
      </td>
    )}
  </tr>
);

  const { page, ...queryParams } = searchParams;

  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION

  const query: Prisma.ParentWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
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
    prisma.parent.findMany({
      where: query,
      include: {
        students: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.parent.count({ where: query }),
  ]);

  return (
    <div className="space-y-6 p-6">
      <Card className="border-0 shadow-sm bg-gradient-to-r from-white to-slate-50/50">
        <div className="p-6">
          {/* TOP */}
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Parents Directory</h1>
                <p className="text-sm text-slate-600">Manage parent information and student relationships</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 sm:flex-initial">
                <TableSearch />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => console.log('Filter parents')}>
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => console.log('Sort parents')}>
                  <ArrowUpDown className="w-4 h-4" />
                  Sort
                </Button>
                {isAdmin && (
                  <FormContainer table="parent" type="create" />
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* LIST */}
      <Card className="border-0 shadow-sm">
        <Table columns={columns} renderRow={renderRow} data={data} />
      </Card>
      
      {/* PAGINATION */}
      <div className="flex justify-center">
        <Pagination page={p} count={count} />
      </div>
    </div>
  );
};

export default ParentListPage;
