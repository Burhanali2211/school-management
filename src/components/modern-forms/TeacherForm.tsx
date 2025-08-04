"use client";

import React from 'react';
import { z } from 'zod';
import { BaseForm, InputField, SelectField, TextAreaField, ImageUploadField } from './BaseForm';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const TeacherFormSchema = z.object({
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
  subjectIds: z.array(z.number()).optional(),
  classIds: z.array(z.number()).optional(),
});

type TeacherFormData = z.infer<typeof TeacherFormSchema>;

interface TeacherFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<TeacherFormData>;
  onSuccess: () => void;
  onCancel: () => void;
  relatedData?: {
    subjects: Array<{ id: number; name: string }>;
    classes: Array<{ id: number; name: string }>;
  };
}

export function TeacherForm({ 
  mode, 
  initialData, 
  onSuccess, 
  onCancel, 
  relatedData 
}: TeacherFormProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: TeacherFormData) => {
    try {
      const url = mode === 'create' 
        ? '/api/teachers'
        : `/api/teachers/${initialData?.id || ''}`;
      
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
        throw new Error(errorData.message || `Failed to ${mode} teacher`);
      }

      const result = await response.json();
      
      toast.success(`Teacher ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      onSuccess();
      router.refresh();
    } catch (error: any) {
      console.error(`Error ${mode}ing teacher:`, error);
      throw error; // Let BaseForm handle the error display
    }
  };

  const defaultValues: Partial<TeacherFormData> = {
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
    subjectIds: initialData?.subjectIds || [],
    classIds: initialData?.classIds || [],
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

  return (
    <BaseForm
      schema={TeacherFormSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      title={mode === 'create' ? 'Add New Teacher' : 'Edit Teacher'}
      subtitle={mode === 'create' 
        ? 'Create a new teacher account with all necessary details' 
        : 'Update teacher information and details'
      }
      submitText={mode === 'create' ? 'Create Teacher' : 'Update Teacher'}
    >
      {({ register, errors, watch, setValue, formState }) => (
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
          {relatedData && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedData.subjects && relatedData.subjects.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Subjects
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-neutral-300 rounded-xl p-4">
                      {relatedData.subjects.map((subject) => (
                        <label key={subject.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={subject.id}
                            {...register('subjectIds')}
                            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-neutral-700">{subject.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {relatedData.classes && relatedData.classes.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Classes
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto border border-neutral-300 rounded-xl p-4">
                      {relatedData.classes.map((classItem) => (
                        <label key={classItem.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            value={classItem.id}
                            {...register('classIds')}
                            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                          />
                          <span className="text-sm text-neutral-700">{classItem.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </BaseForm>
  );
}

export default TeacherForm;