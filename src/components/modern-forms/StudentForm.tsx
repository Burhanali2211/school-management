"use client";

import React, { useEffect, useState } from 'react';
import { z } from 'zod';
import { BaseForm, InputField, SelectField, TextAreaField, ImageUploadField } from './BaseForm';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const StudentFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().min(10, "Address must be at least 10 characters"),
  img: z.string().optional().nullable(),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    errorMap: () => ({ message: "Please select a valid blood type" })
  }),
  sex: z.enum(["MALE", "FEMALE"], {
    errorMap: () => ({ message: "Please select gender" })
  }),
  birthday: z.string().min(1, "Birthday is required"),
  parentId: z.string().min(1, "Please select a parent"),
  classId: z.number().min(1, "Please select a class"),
  gradeId: z.number().min(1, "Please select a grade"),
});

type StudentFormData = z.infer<typeof StudentFormSchema>;

interface StudentFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<StudentFormData>;
  onSuccess: () => void;
  onCancel: () => void;
  relatedData?: {
    parents: Array<{ id: string; name: string; surname: string }>;
    classes: Array<{ id: number; name: string; gradeId?: number }>;
    grades: Array<{ id: number; level: number }>;
  };
}

export function StudentForm({ 
  mode, 
  initialData, 
  onSuccess, 
  onCancel, 
  relatedData 
}: StudentFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [availableClasses, setAvailableClasses] = useState(relatedData?.classes || []);

  const handleSubmit = async (data: StudentFormData) => {
    try {
      const url = mode === 'create' 
        ? '/api/students'
        : `/api/students/${initialData?.id || ''}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          birthday: new Date(data.birthday).toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${mode} student`);
      }

      const result = await response.json();
      
      toast.success(`Student ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      onSuccess();
      router.refresh();
    } catch (error: any) {
      console.error(`Error ${mode}ing student:`, error);
      throw error; // Let BaseForm handle the error display
    }
  };

  const defaultValues: Partial<StudentFormData> = {
    username: initialData?.username || '',
    name: initialData?.name || '',
    surname: initialData?.surname || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    img: initialData?.img || null,
    bloodType: (initialData?.bloodType as any) || undefined,
    sex: (initialData?.sex as any) || undefined,
    birthday: initialData?.birthday ? new Date(initialData.birthday).toISOString().split('T')[0] : '',
    parentId: initialData?.parentId || '',
    classId: initialData?.classId || undefined,
    gradeId: initialData?.gradeId || undefined,
  };

  const bloodTypeOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
  ];

  const genderOptions = [
    { value: "MALE", label: "Male" },
    { value: "FEMALE", label: "Female" },
  ];

  const parentOptions = relatedData?.parents.map(parent => ({
    value: parent.id,
    label: `${parent.name} ${parent.surname}`
  })) || [];

  const gradeOptions = relatedData?.grades.map(grade => ({
    value: grade.id,
    label: grade.name || `Grade ${grade.level}`
  })) || [];

  const classOptions = availableClasses.map(cls => ({
    value: cls.id,
    label: cls.name
  }));

  return (
    <BaseForm
      schema={StudentFormSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      title={mode === 'create' ? 'Add New Student' : 'Edit Student'}
      subtitle={mode === 'create' 
        ? 'Create a new student account with all necessary details' 
        : 'Update student information and details'
      }
      submitText={mode === 'create' ? 'Create Student' : 'Update Student'}
    >
      {({ register, errors, watch, setValue, formState }) => {
        const selectedGradeId = watch('gradeId');

        // Filter classes based on selected grade
        useEffect(() => {
          if (selectedGradeId && relatedData?.classes) {
            const filteredClasses = relatedData.classes.filter(
              cls => cls.gradeId === selectedGradeId
            );
            setAvailableClasses(filteredClasses);
            // Reset class selection if it's not in the filtered list
            const currentClassId = watch('classId');
            if (currentClassId && !filteredClasses.find(cls => cls.id === currentClassId)) {
              setValue('classId', undefined);
            }
          }
        }, [selectedGradeId, relatedData?.classes, setValue, watch]);

        return (
          <div className="space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField
                  label="Username"
                  name="username"
                  placeholder="Enter username"
                  register={register}
                  error={errors.username}
                  required
                />
                <InputField
                  label="First Name"
                  name="name"
                  placeholder="Enter first name"
                  register={register}
                  error={errors.name}
                  required
                />
                <InputField
                  label="Last Name"
                  name="surname"
                  placeholder="Enter last name"
                  register={register}
                  error={errors.surname}
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="Enter email address"
                  register={register}
                  error={errors.email}
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  register={register}
                  error={errors.phone}
                />
              </div>
              <div className="mt-6">
                <TextAreaField
                  label="Address"
                  name="address"
                  placeholder="Enter full address"
                  register={register}
                  error={errors.address}
                  required
                  rows={3}
                />
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SelectField
                  label="Gender"
                  name="sex"
                  options={genderOptions}
                  placeholder="Select gender"
                  register={register}
                  error={errors.sex}
                  required
                />
                <InputField
                  label="Date of Birth"
                  name="birthday"
                  type="date"
                  register={register}
                  error={errors.birthday}
                  required
                />
                <SelectField
                  label="Blood Type"
                  name="bloodType"
                  options={bloodTypeOptions}
                  placeholder="Select blood type"
                  register={register}
                  error={errors.bloodType}
                  required
                />
                <div className="md:col-span-2 lg:col-span-1">
                  <ImageUploadField
                    label="Profile Picture"
                    name="img"
                    register={register}
                    error={errors.img}
                    setValue={setValue}
                    watch={watch}
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SelectField
                  label="Parent/Guardian"
                  name="parentId"
                  options={parentOptions}
                  placeholder="Select parent"
                  register={register}
                  error={errors.parentId}
                  required
                />
                <SelectField
                  label="Grade"
                  name="gradeId"
                  options={gradeOptions}
                  placeholder="Select grade"
                  register={(name) => register(name, { valueAsNumber: true })}
                  error={errors.gradeId}
                  required
                />
                <SelectField
                  label="Class"
                  name="classId"
                  options={classOptions}
                  placeholder="Select class"
                  register={(name) => register(name, { valueAsNumber: true })}
                  error={errors.classId}
                  required
                />
              </div>
              {selectedGradeId && availableClasses.length === 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800">
                    No classes available for the selected grade. Please contact an administrator.
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </BaseForm>
  );
}

export default StudentForm;