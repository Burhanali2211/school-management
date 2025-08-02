"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { attendanceSchema, AttendanceSchema } from "@/lib/formValidationSchemas";
import { createAttendance, updateAttendance } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import InputField from "../InputField";

const AttendanceForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AttendanceSchema>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: data ? {
      ...data,
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
    } : undefined,
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAttendance : updateAttendance,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Attendance has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((data) => {
    formAction(data);
  });

  const { students, lessons } = relatedData || {};

  return (
    <form className="flex flex-col gap-8 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-neutral-200" onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">
        {type === "create" ? "Create a new attendance record" : "Update the attendance record"}
      </h1>
      
      <span className="text-sm text-neutral-500 font-medium border-b border-neutral-200 pb-2">
        Attendance Information
      </span>
      
      <div className="flex justify-between flex-wrap gap-4">
        {/* Date */}
        <InputField
          label="Date"
          name="date"
          type="date"
          defaultValue={data?.date ? new Date(data.date).toISOString().split('T')[0] : ''}
          register={register}
          error={errors.date}
        />

        {/* Student */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-sm text-neutral-700 font-medium">Student</label>
          <select
            className="ring-2 ring-neutral-300 focus:ring-primary-500 p-3 rounded-lg text-sm w-full transition-all duration-200"
            {...register("studentId")}
            defaultValue={data?.studentId}
          >
            <option value="">Select a student</option>
            {students?.map((student: { id: string; name: string; surname: string }) => (
              <option value={student.id} key={student.id}>
                {student.name} {student.surname}
              </option>
            ))}
          </select>
          {errors.studentId?.message && (
            <p className="text-xs text-red-400">
              {errors.studentId.message.toString()}
            </p>
          )}
        </div>

        {/* Lesson */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-sm text-neutral-700 font-medium">Lesson</label>
          <select
            className="ring-2 ring-neutral-300 focus:ring-primary-500 p-3 rounded-lg text-sm w-full transition-all duration-200"
            {...register("lessonId")}
            defaultValue={data?.lessonId}
          >
            <option value="">Select a lesson</option>
            {lessons?.map((lesson: { id: number; name: string; subject: { name: string } }) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.name} - {lesson.subject.name}
              </option>
            ))}
          </select>
          {errors.lessonId?.message && (
            <p className="text-xs text-red-400">
              {errors.lessonId.message.toString()}
            </p>
          )}
        </div>

        {/* Present */}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-sm text-neutral-700 font-medium">Status</label>
          <select
            className="ring-2 ring-neutral-300 focus:ring-primary-500 p-3 rounded-lg text-sm w-full transition-all duration-200"
            {...register("present", { valueAsNumber: false })}
            defaultValue={data?.present ? "true" : "false"}
          >
            <option value="true">Present</option>
            <option value="false">Absent</option>
          </select>
          {errors.present?.message && (
            <p className="text-xs text-red-400">
              {errors.present.message.toString()}
            </p>
          )}
        </div>

        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>
      
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      
      <button 
        type="submit" 
        className="bg-blue-400 text-white p-2 rounded-md hover:bg-blue-500 transition-colors"
      >
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AttendanceForm;
