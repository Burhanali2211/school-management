import prisma from "@/lib/prisma";
import { UserIcon, UsersIcon, GraduationCapIcon, ShieldCheckIcon, TrendingUpIcon } from "lucide-react";
import Card from "@/components/ui/card";

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

  const data = await modelMap[type].count();

  // Modern icon mapping
  const iconMap = {
    admin: ShieldCheckIcon,
    teacher: GraduationCapIcon,
    student: UserIcon,
    parent: UsersIcon,
  };

  // Modern color mapping
  const colorMap = {
    admin: 'bg-gradient-to-br from-purple-500 to-purple-600',
    teacher: 'bg-gradient-to-br from-blue-500 to-blue-600',
    student: 'bg-gradient-to-br from-green-500 to-green-600',
    parent: 'bg-gradient-to-br from-orange-500 to-orange-600',
  };

  const IconComponent = iconMap[type];

  return (
    <Card hover className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${colorMap[type]}`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-1 text-success-500">
          <TrendingUpIcon className="w-4 h-4" />
          <span className="text-xs font-medium">+5%</span>
        </div>
      </div>
      
      <div className="mt-4">
        <h1 className="text-3xl font-bold text-secondary-900">{data}</h1>
        <h2 className="capitalize text-sm font-medium text-secondary-500 mt-1">
          {type === 'admin' ? 'Administrators' : `${type}s`}
        </h2>
      </div>
      
      <div className="mt-4 pt-4 border-t border-secondary-200">
        <span className="text-xs text-secondary-500">Academic Year 2024/25</span>
      </div>
    </Card>
  );
};

export default UserCard;
