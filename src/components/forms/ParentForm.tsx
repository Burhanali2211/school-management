"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { z } from "zod";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const parentSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, { message: "Username must be at least 3 characters long!" }),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z.string().email({ message: "Invalid email address!" }).optional().or(z.literal("")),
  phone: z.string().min(1, { message: "Phone is required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
});

type ParentSchema = z.infer<typeof parentSchema>;

// Mock actions - you can replace these with actual actions later
const createParent = async (prevState: any, data: ParentSchema) => {
  console.log("Creating parent:", data);
  return { success: true, error: false };
};

const updateParent = async (prevState: any, data: ParentSchema) => {
  console.log("Updating parent:", data);
  return { success: true, error: false };
};

const ParentForm = ({
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
  } = useForm<ParentSchema>({
    resolver: zodResolver(parentSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [state, formAction] = useFormState(
    type === "create" ? createParent : updateParent,
    {
      success: false,
      error: false,
    }
  );

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

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast.success(`Parent has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
      setIsSubmitting(false);
    } else if (state.error) {
      toast.error((state as any).message || "Something went wrong! Please try again.");
      setIsSubmitting(false);
    }
  }, [state, router, type, setOpen]);

  return (
    <form className="flex flex-col gap-8 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-neutral-200" onSubmit={onSubmit}>
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">
        {type === "create" ? "Create a new parent" : "Update the parent"}
      </h1>
      <span className="text-sm text-neutral-500 font-medium border-b border-neutral-200 pb-2">
        Parent Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          defaultValue={data?.username}
          register={register}
          error={errors?.username}
        />
        <InputField
          label="Email"
          name="email"
          defaultValue={data?.email}
          register={register}
          error={errors?.email}
        />
        <InputField
          label="First Name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors.name}
        />
        <InputField
          label="Last Name"
          name="surname"
          defaultValue={data?.surname}
          register={register}
          error={errors.surname}
        />
        <InputField
          label="Phone"
          name="phone"
          defaultValue={data?.phone}
          register={register}
          error={errors.phone}
        />
        <InputField
          label="Address"
          name="address"
          defaultValue={data?.address}
          register={register}
          error={errors.address}
        />
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
          : (type === "create" ? "Create Parent" : "Update Parent")
        }
      </button>
    </form>
  );
};

export default ParentForm;
