"use client";

import { z } from "zod";
import { BaseForm, FormField, InputField } from "./BaseForm";
import { toast } from "react-hot-toast";

const SubjectFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Subject name is required"),
  teachers: z.array(z.string()).optional(),
});

type SubjectFormData = z.infer<typeof SubjectFormSchema>;

interface SubjectFormProps {
  mode: "create" | "update";
  onSuccess?: () => void;
  onCancel?: () => void;
  initialData?: Partial<SubjectFormData>;
  relatedData?: {
    teachers?: Array<{ id: string; name: string; surname: string }>;
  };
}

export function SubjectForm({
  mode,
  onSuccess,
  onCancel,
  initialData,
  relatedData,
}: SubjectFormProps) {
  const handleSubmit = async (data: SubjectFormData) => {
    try {
      const url = mode === "create" ? "/api/subjects" : `/api/subjects/${data.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save subject");
      }

      toast.success(`Subject ${mode === "create" ? "created" : "updated"} successfully!`);
      onSuccess?.();
    } catch (error) {
      console.error("Error saving subject:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save subject");
    }
  };

  const defaultValues: Partial<SubjectFormData> = {
    name: "",
    teachers: [],
    ...initialData,
  };

  return (
    <BaseForm
      schema={SubjectFormSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={onCancel || (() => {})}
      title={mode === "create" ? "Create New Subject" : "Update Subject"}
      subtitle={mode === "create" ? "Add a new subject to the system" : "Modify subject information"}
      submitText={mode === "create" ? "Create Subject" : "Update Subject"}
      cancelText="Cancel"
    >
      {({ register, errors }) => (
        <>
          <InputField
            label="Subject Name"
            name="name"
            placeholder="Enter subject name"
            register={register}
            error={errors.name}
            required
          />

          <FormField
            label="Teachers"
            name="teachers"
            register={register}
            error={errors.teachers}
            required={false}
          >
            <select
              multiple
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              {...register("teachers")}
            >
              {relatedData?.teachers?.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name} {teacher.surname}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple teachers
            </p>
          </FormField>
        </>
      )}
    </BaseForm>
  );
}

export default SubjectForm; 