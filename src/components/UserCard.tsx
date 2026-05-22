import { Users } from "lucide-react";
import prisma from "@/lib/prisma";

const UserCard = async ({
  type,
}: {
  type: "admin" | "teacher" | "student" | "parent";
}) => {
  const modelMap: Record<typeof type, any> = {
    admin: prisma.admin,
    teacher: prisma.teacher,
    student: prisma.student,
    parent: prisma.parent,
  };

  const count = await modelMap[type].count();

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-100 flex-1 min-w-[200px]">
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] bg-primary-100 text-primary-600 px-2 py-1 rounded-full uppercase font-medium">
          2026/2027
        </span>
        <Users className="w-5 h-5 text-neutral-400" />
      </div>
      <h1 className="text-3xl font-bold text-neutral-800 my-4">{count}</h1>
      <h2 className="capitalize text-sm font-medium text-neutral-500">{type}s</h2>
    </div>
  );
};

export default UserCard;
