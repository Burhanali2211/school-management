"use client";

import React from 'react';
import { z } from 'zod';
import { BaseForm, InputField, SelectField, TextAreaField, ImageUploadField } from './BaseForm';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const ParentFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  img: z.string().optional().nullable(),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
    errorMap: () => ({ message: "Please select a valid blood type" })
  }),
  sex: z.enum(["MALE", "FEMALE"], {
    errorMap: () => ({ message: "Please select gender" })
  }),
  birthday: z.string().min(1, "Birthday is required"),
  occupation: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
});

type ParentFormData = z.infer<typeof ParentFormSchema>;

interface ParentFormProps {
  mode: 'create' | 'update';
  initialData?: Partial<ParentFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
  relatedData?: {
    students?: Array<{ id: string; name: string; surname: string }>;
  };
}

export function ParentForm({ 
  mode, 
  initialData, 
  onSuccess, 
  onCancel,
  relatedData
}: ParentFormProps) {
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (data: ParentFormData) => {
    try {
      const url = mode === 'create' 
        ? '/api/parents'
        : `/api/parents/${initialData?.id || ''}`;
      
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
        throw new Error(errorData.message || `Failed to ${mode} parent`);
      }

      const result = await response.json();
      
      toast.success(`Parent ${mode === 'create' ? 'created' : 'updated'} successfully!`);
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      console.error(`Error ${mode}ing parent:`, error);
      throw error; // Let BaseForm handle the error display
    }
  };

  const defaultValues: Partial<ParentFormData> = {
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
    occupation: initialData?.occupation || '',
    emergencyContact: initialData?.emergencyContact || '',
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
      schema={ParentFormSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      title={mode === 'create' ? 'Add New Parent' : 'Edit Parent'}
      subtitle={mode === 'create' 
        ? 'Create a new parent/guardian account with all necessary details' 
        : 'Update parent/guardian information and details'
      }
      submitText={mode === 'create' ? 'Create Parent' : 'Update Parent'}
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
                required
              />
            </div>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextAreaField
                label="Address"
                name="address"
                placeholder="Enter full address"
                register={register}
                error={errors.address}
                required
                rows={3}
              />
              <InputField
                label="Emergency Contact"
                name="emergencyContact"
                type="tel"
                placeholder="Enter emergency contact number"
                register={register}
                error={errors.emergencyContact}
              />
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
              <InputField
                label="Occupation"
                name="occupation"
                placeholder="Enter occupation"
                register={register}
                error={errors.occupation}
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

          {/* Additional Information */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
              Additional Information
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Important Note</h4>
                  <p className="text-sm text-blue-800">
                    Once the parent account is created, you can link it to student accounts. 
                    The parent will be able to monitor their children's academic progress, 
                    attendance, and receive important notifications from the school.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </BaseForm>
  );
}

export default ParentForm;