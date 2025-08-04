"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  classSchema,
  ClassSchema,
} from "@/lib/formValidationSchemas";
import {
  createClass,
  updateClass,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { School, Users, GraduationCap, User } from "lucide-react";

const ClassForm = ({
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
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: data ? {
      id: data.id,
      name: data.name,
      capacity: data.capacity,
      gradeId: data.gradeId,
      supervisorId: data.supervisorId,
    } : undefined,
  });

  const [state, formAction] = useFormState(
    type === "create" ? createClass : updateClass,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((formData) => {
    console.log(formData);
    formAction(formData);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Class has been ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
      reset();
    } else if (state.error) {
      toast.error("Something went wrong! Please try again.");
    }
  }, [state, router, type, setOpen, reset]);

  const { teachers, grades } = relatedData || { teachers: [], grades: [] };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <School className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {type === "create" ? "Create New Class" : "Update Class"}
          </h2>
          <p className="text-sm text-gray-500">
            {type === "create" ? "Add a new class to your school" : "Update class information"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Class Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <School className="w-4 h-4" />
            Class Name
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Enter class name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Capacity */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Capacity
          </label>
          <input
            {...register("capacity")}
            type="number"
            min="1"
            placeholder="Enter capacity"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.capacity && (
            <p className="text-sm text-red-600">{errors.capacity.message}</p>
          )}
        </div>

        {/* Grade */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Grade Level
          </label>
          <select
            {...register("gradeId")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select grade level</option>
            {grades.map((grade: { id: number; level: number; name?: string }) => (
              <option key={grade.id} value={grade.id}>
                {grade.name || `Grade ${grade.level}`}
              </option>
            ))}
          </select>
          {errors.gradeId && (
            <p className="text-sm text-red-600">{errors.gradeId.message}</p>
          )}
        </div>

        {/* Supervisor */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Supervisor (Optional)
          </label>
          <select
            {...register("supervisorId")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select supervisor</option>
            {teachers.map((teacher: { id: string; name: string; surname: string }) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.name} {teacher.surname}
              </option>
            ))}
          </select>
          {errors.supervisorId && (
            <p className="text-sm text-red-600">{errors.supervisorId.message}</p>
          )}
        </div>
      </div>

      {/* Hidden ID field for updates */}
      {data && (
        <input
          {...register("id")}
          type="hidden"
        />
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {type === "create" ? "Creating..." : "Updating..."}
            </div>
          ) : (
            type === "create" ? "Create Class" : "Update Class"
          )}
        </Button>
      </div>
    </form>
  );
};

export default ClassForm;
