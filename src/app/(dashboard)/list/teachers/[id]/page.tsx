import Announcements from "@/components/Announcements";
import BigCalendar from "@/components/BigCalender";
import FormContainer from "@/components/FormContainer";
import Performance from "@/components/Performance";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth-utils";
import { UserType } from "@prisma/client";
import { Teacher } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

const SingleTeacherPage = async ({
  params: { id },
}: {
  params: { id: string };
}) => {
  const user = await getAuthUser();
  const isAdmin = user?.userType === UserType.ADMIN;

  const teacher:
    | (Teacher & {
        _count: { subjects: number; lessons: number; classes: number };
      })
    | null = await prisma.teacher.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          subjects: true,
          lessons: true,
          classes: true,
        },
      },
    },
  });

  if (!teacher) {
    return notFound();
  }
  return (
    <div className="flex-1 p-4 flex flex-col gap-4 xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        {/* TOP */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* USER INFO CARD */}
          <div className="bg-primary-200 py-6 px-4 rounded-md flex-1 flex gap-4">
            <div className="w-1/3">
              <Image
                src={teacher.img || "/noAvatar.png"}
                alt=""
                width={144}
                height={144}
                className="w-36 h-36 rounded-full object-cover"
              />
            </div>
            <div className="w-2/3 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">
                  {teacher.name + " " + teacher.surname}
                </h1>
                {isAdmin && (
                  <FormContainer table="teacher" type="update" data={teacher} />
                )}
              </div>
              <p className="text-sm text-gray-500">
                Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              </p>
              <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-medium">
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/blood.png" alt="" width={14} height={14} />
                  <span>{teacher.bloodType}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/date.png" alt="" width={14} height={14} />
                  <span>
                    {new Intl.DateTimeFormat("en-GB").format(teacher.birthday)}
                  </span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/mail.png" alt="" width={14} height={14} />
                  <span>{teacher.email || "-"}</span>
                </div>
                <div className="w-full md:w-1/3 lg:w-full 2xl:w-1/3 flex items-center gap-2">
                  <Image src="/phone.png" alt="" width={14} height={14} />
                  <span>{teacher.phone || "-"}</span>
                </div>
              </div>
            </div>
          </div>
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* ATTENDANCE CARD */}
            <div className="bg-gradient-to-br from-white to-primary-50/30 p-6 rounded-2xl shadow-soft border border-primary-100/50 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Image
                  src="/singleAttendance.png"
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <div className="">
                <h1 className="text-xl font-semibold text-primary-900">90%</h1>
                <span className="text-sm text-primary-600">Attendance</span>
              </div>
            </div>

            {/* SUBJECTS CARD */}
            <div className="bg-gradient-to-br from-white to-accent-50/30 p-6 rounded-2xl shadow-soft border border-accent-100/50 flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Image
                  src="/singleBranch.png"
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <div className="">
                <h1 className="text-xl font-semibold text-accent-900">
                  {teacher._count.subjects}
                </h1>
                <span className="text-sm text-accent-600">Branches</span>
              </div>
            </div>

            {/* LESSONS CARD */}
            <div className="bg-gradient-to-br from-white to-secondary-50/30 p-6 rounded-2xl shadow-soft border border-secondary-100/50 flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Image
                  src="/singleLesson.png"
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <div className="">
                <h1 className="text-xl font-semibold text-secondary-900">
                  {teacher._count.lessons}
                </h1>
                <span className="text-sm text-secondary-600">Lessons</span>
              </div>
            </div>

            {/* CLASSES CARD */}
            <div className="bg-gradient-to-br from-white to-success-50/30 p-6 rounded-2xl shadow-soft border border-success-100/50 flex items-center gap-4">
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <Image
                  src="/singleClass.png"
                  alt=""
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
              </div>
              <div className="">
                <h1 className="text-xl font-semibold text-success-900">
                  {teacher._count.classes}
                </h1>
                <span className="text-sm text-success-600">Classes</span>
              </div>
            </div>
          </div>
        </div>
        {/* BOTTOM */}
        <div className="mt-8 bg-gradient-to-br from-white to-neutral-50/30 rounded-2xl p-6 shadow-soft border border-neutral-100/50 h-[800px]">
          <h1 className="text-xl font-semibold text-neutral-900 mb-4">Teacher&apos;s Schedule</h1>
          <div className="flex items-center justify-center h-full text-neutral-500">
            <p>Calendar component removed</p>
          </div>
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <div className="bg-gradient-to-br from-white to-primary-50/30 rounded-2xl p-6 shadow-soft border border-primary-100/50">
          <h1 className="text-xl font-semibold text-primary-900 mb-4">Shortcuts</h1>
          <div className="mt-4 flex gap-4 flex-wrap text-xs text-gray-500">
           <Link
              className="p-3 rounded-md bg-primary-50"
              href={`/list/classes?supervisorId=${teacher.id}`}
            >
              Teacher&apos;s Classes
            </Link>
            <Link
              className="p-3 rounded-md bg-secondary-100"
              href={`/list/students?teacherId=${teacher.id}`}
            >
              Teacher&apos;s Students
            </Link>
            <Link
              className="p-3 rounded-md bg-warning-50"
              href={`/list/lessons?teacherId=${teacher.id}`}
            >
              Teacher&apos;s Lessons
            </Link>
            <Link
              className="p-3 rounded-md bg-pink-50"
              href={`/list/exams?teacherId=${teacher.id}`}
            >
              Teacher&apos;s Exams
            </Link>
            <Link
              className="p-3 rounded-md bg-primary-50"
              href={`/list/assignments?teacherId=${teacher.id}`}
            >
              Teacher&apos;s Assignments
            </Link>
          </div>
        </div>
        <Performance />
        <Announcements />
      </div>
    </div>
  );
};

export default SingleTeacherPage;
