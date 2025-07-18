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

  // Modern color mapping using design system colors
  const colorMap = {
    admin: 'bg-gradient-to-br from-primary-500 to-primary-600',
    teacher: 'bg-gradient-to-br from-accent-500 to-accent-600',
    student: 'bg-gradient-to-br from-success-500 to-success-600',
    parent: 'bg-gradient-to-br from-warning-500 to-warning-600',
  };

  const IconComponent = iconMap[type];

  return (
    <Card hover className="relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorMap[type]} shadow-lg group-hover:shadow-xl transition-shadow duration-200`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-1 text-success-500 bg-success-50 px-2 py-1 rounded-full">
          <TrendingUpIcon className="w-3 h-3" />
          <span className="text-xs font-medium">+5%</span>
        </div>
      </div>

      <div className="mb-4">
        <h1 className="text-3xl font-bold text-secondary-900 mb-1">{data}</h1>
        <h2 className="capitalize text-sm font-medium text-secondary-500">
          {type === 'admin' ? 'Administrators' : `${type}s`}
        </h2>
      </div>

      <div className="pt-4 border-t border-secondary-200">
        <div className="flex items-center justify-between">
          <span className="text-xs text-secondary-500">Academic Year 2024/25</span>
          <div className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Subtle background pattern */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
        <IconComponent className="w-full h-full text-secondary-900" />
      </div>
    </Card>
  );
};

export default UserCard;
