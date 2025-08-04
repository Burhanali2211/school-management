"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useRouter } from "next/navigation";

const TeacherFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  name: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  img: z.string().optional(),
  bloodType: z.string().min(1, "Blood type is required"),
  sex: z.enum(["MALE", "FEMALE"], {
    required_error: "Gender is required"
  }),
  birthday: z.string().min(1, "Birthday is required"),
  subjectIds: z.array(z.number()).optional(),
  classIds: z.array(z.number()).optional(),
});

type TeacherFormData = z.infer<typeof TeacherFormSchema>;

interface TeacherFormProps {
  type: "create" | "update";
  data?: any;
  setOpen: (open: boolean) => void;
  relatedData?: {
    subjects?: any[];
    classes?: any[];
  };
}

export default function TeacherFormNew({
  type,
  data,
  setOpen,
  relatedData
}: TeacherFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<TeacherFormData>({
    resolver: zodResolver(TeacherFormSchema),
    defaultValues: data ? {
      ...data,
      birthday: data.birthday ? new Date(data.birthday).toISOString().split('T')[0] : '',
      email: data.email || "",
      phone: data.phone || "",
      subjectIds: data.subjects?.map((s: any) => s.id) || [],
      classIds: data.classes?.map((c: any) => c.id) || [],
    } : {
      email: "",
      phone: "",
      subjectIds: [],
      classIds: [],
    },
  });

  const [img, setImg] = useState<string>(data?.img || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string>("");
  const router = useRouter();

  const selectedSubjects = watch("subjectIds") || [];
  const selectedClasses = watch("classIds") || [];

  useEffect(() => {
    if (img) {
      setValue("img", img);
    }
  }, [img, setValue]);

  const onSubmit = async (formData: TeacherFormData) => {
    setIsSubmitting(true);
    setApiError("");

    try {
      const payload = {
        ...formData,
        email: formData.email || null,
        phone: formData.phone || null,
        img: img || null,
      };

      const url = type === "create" 
        ? "/api/teachers"
        : `/api/teachers/${data.id}`;
      
      const method = type === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400 && result.error) {
          // Handle validation errors
          if (Array.isArray(result.error)) {
            const errorMessage = result.error.map((err: any) => 
              `${err.path.join('.')}: ${err.message}`
            ).join(', ');
            setApiError(errorMessage);
          } else {
            setApiError(result.error);
          }
        } else if (response.status === 403) {
          setApiError("You don't have permission to perform this action");
        } else {
          setApiError(result.error || `Failed to ${type} teacher`);
        }
        return;
      }

      toast.success(`Teacher ${type === "create" ? "created" : "updated"} successfully!`);
      setOpen(false);
      router.refresh();
      
      // Reset form for create operations
      if (type === "create") {
        reset();
        setImg("");
      }

    } catch (error) {
      console.error(`Error ${type}ing teacher:`, error);
      setApiError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubjectChange = (subjectId: number, checked: boolean) => {
    const current = selectedSubjects;
    if (checked) {
      setValue("subjectIds", [...current, subjectId]);
    } else {
      setValue("subjectIds", current.filter(id => id !== subjectId));
    }
  };

  const handleClassChange = (classId: number, checked: boolean) => {
    const current = selectedClasses;
    if (checked) {
      setValue("classIds", [...current, classId]);
    } else {
      setValue("classIds", current.filter(id => id !== classId));
    }
  };

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <form 
        className="flex flex-col gap-6 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-neutral-200" 
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          {type === "create" ? "Create New Teacher" : "Update Teacher"}
        </h1>

        {/* Authentication Information */}
        <div className="space-y-4">
          <h3 className="text-sm text-neutral-500 font-medium border-b border-neutral-200 pb-2">
            Authentication Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Username *
              </label>
              <input
                {...register("username")}
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter username"
              />
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-sm text-neutral-500 font-medium border-b border-neutral-200 pb-2">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                First Name *
              </label>
              <input
                {...register("name")}
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter first name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Last Name *
              </label>
              <input
                {...register("surname")}
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter last name"
              />
              {errors.surname && (
                <p className="text-sm text-red-500">{errors.surname.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Phone
              </label>
              <input
                {...register("phone")}
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter phone number"
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Birthday *
              </label>
              <input
                {...register("birthday")}
                type="date"
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              />
              {errors.birthday && (
                <p className="text-sm text-red-500">{errors.birthday.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Gender *
              </label>
              <select
                {...register("sex")}
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {errors.sex && (
                <p className="text-sm text-red-500">{errors.sex.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-neutral-700">
                Blood Type *
              </label>
              <select
                {...register("bloodType")}
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              {errors.bloodType && (
                <p className="text-sm text-red-500">{errors.bloodType.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700">
                Address *
              </label>
              <textarea
                {...register("address")}
                rows={3}
                className="w-full p-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Enter full address"
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-4">
          <h3 className="text-sm text-neutral-500 font-medium border-b border-neutral-200 pb-2">
            Profile Photo
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full border-2 border-neutral-200 overflow-hidden bg-neutral-100 flex items-center justify-center">
              {img ? (
                <Image src={img} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <span className="text-neutral-400 text-sm">No photo</span>
              )}
            </div>
            <CldUploadWidget
              uploadPreset="school_management"
              onSuccess={(result: any) => setImg(result.info?.secure_url)}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open?.()}
                  className="px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                >
                  Upload Photo
                </button>
              )}
            </CldUploadWidget>
          </div>
        </div>

        {/* Subjects */}
        {relatedData?.subjects && relatedData.subjects.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm text-neutral-500 font-medium border-b border-neutral-200 pb-2">
              Subjects
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedData.subjects.map((subject: any) => (
                <label key={subject.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject.id)}
                    onChange={(e) => handleSubjectChange(subject.id, e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">{subject.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Classes */}
        {relatedData?.classes && relatedData.classes.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm text-neutral-500 font-medium border-b border-neutral-200 pb-2">
              Classes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {relatedData.classes.map((cls: any) => (
                <label key={cls.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(cls.id)}
                    onChange={(e) => handleClassChange(cls.id, e.target.checked)}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-700">
                    {cls.name} {cls.grade && `(${cls.grade.name})`}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm font-medium">Error</p>
            <p className="text-sm">{apiError}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-6 py-3 text-neutral-600 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isSubmitting && (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {isSubmitting
              ? (type === "create" ? "Creating..." : "Updating...")
              : (type === "create" ? "Create Teacher" : "Update Teacher")
            }
          </button>
        </div>
      </form>
    </div>
  );
}