"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { announcementSchema, AnnouncementSchema } from "@/lib/formValidationSchemas";
import { createAnnouncement, updateAnnouncement } from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const AnnouncementForm = ({
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
  } = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: data
      ? {
          ...data,
          date: data.date ? new Date(data.date) : undefined,
        }
      : undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, formAction] = useFormState(
    type === "create" ? createAnnouncement : updateAnnouncement,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Announcement has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
      setIsSubmitting(false);
    } else if (state.error) {
      toast.error((state as any).message || "Something went wrong! Please try again.");
      setIsSubmitting(false);
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      formAction(data);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form. Please try again.");
      setIsSubmitting(false);
    }
  });

  const { classes } = relatedData || {};

  return (
    <form className="flex flex-col gap-8 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-neutral-200" onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">
        {type === "create" ? "Create a new announcement" : "Update announcement"}
      </h1>
      <span className="text-sm text-neutral-500 font-medium border-b border-neutral-200 pb-2">
        Announcement Details
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">Title</label>
          <input
            type="text"
            {...register("title")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          />
          {errors.title?.message && (
            <p className="text-xs text-red-400">{errors.title.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">Class (Optional)</label>
          <select
            {...register("classId")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          >
            <option value="">All Classes</option>
            {classes?.map((c: { id: number; name: string }) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">{errors.classId.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label className="text-xs text-gray-500">Description</label>
          <textarea
            {...register("description")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            rows={4}
          />
          {errors.description?.message && (
            <p className="text-xs text-red-400">{errors.description.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/2">
          <label className="text-xs text-gray-500">Date</label>
          <input
            type="datetime-local"
            {...register("date")}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
          />
          {errors.date?.message && (
            <p className="text-xs text-red-400">{errors.date.message}</p>
          )}
        </div>
      </div>
      {state.error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg">
          <p className="text-sm font-medium">Error</p>
          <p className="text-sm">{(state as any).message || "Something went wrong! Please try again."}</p>
        </div>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed text-white p-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isSubmitting && (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        )}
        {isSubmitting
          ? (type === "create" ? "Creating..." : "Updating...")
          : (type === "create" ? "Create Announcement" : "Update Announcement")
        }
      </button>
    </form>
  );
};

export default AnnouncementForm;
