"use client";

import React, { useState } from 'react';
import { useForm, FieldValues, Path, UseFormRegister, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Eye, EyeOff, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BaseFormProps<T extends FieldValues> {
  schema: any;
  defaultValues?: Partial<T>;
  onSubmit: (data: T) => Promise<void>;
  onCancel: () => void;
  title: string;
  subtitle?: string;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  children: (methods: {
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
    watch: any;
    setValue: any;
    formState: any;
  }) => React.ReactNode;
}

export function BaseForm<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onCancel,
  title,
  subtitle,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  children
}: BaseFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onChange'
  });

  const { register, handleSubmit, formState: { errors, isValid }, watch, setValue } = methods;

  const handleFormSubmit = async (data: T) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(data);
    } catch (error: any) {
      setSubmitError(error?.message || "An error occurred while submitting the form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">{title}</h1>
        {subtitle && (
          <p className="text-neutral-600">{subtitle}</p>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Error Alert */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{submitError}</p>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-6">
          {children({ register, errors, watch, setValue, formState: methods.formState })}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-neutral-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-w-[100px]"
          >
            {cancelText}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="min-w-[100px] bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

// Form Field Components
interface FormFieldProps {
  label: string;
  name: string;
  register: any;
  error?: any;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, name, register, error, required, className, children }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error.message}</span>
        </p>
      )}
    </div>
  );
}

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  register: any;
  error?: any;
  required?: boolean;
  className?: string;
  inputClassName?: string;
}

export function InputField({
  label,
  name,
  type = 'text',
  placeholder,
  register,
  error,
  required,
  className,
  inputClassName
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <FormField label={label} name={name} register={register} error={error} required={required} className={className}>
      <div className="relative">
        <input
          id={name}
          type={inputType}
          placeholder={placeholder}
          {...register(name)}
          className={cn(
            "w-full px-4 py-3 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
            error && "border-red-300 focus:ring-red-500",
            type === 'password' && "pr-12",
            inputClassName
          )}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </FormField>
  );
}

interface SelectFieldProps {
  label: string;
  name: string;
  options: { value: string | number; label: string }[];
  placeholder?: string;
  register: any;
  error?: any;
  required?: boolean;
  className?: string;
}

export function SelectField({
  label,
  name,
  options,
  placeholder = "Select an option",
  register,
  error,
  required,
  className
}: SelectFieldProps) {
  return (
    <FormField label={label} name={name} register={register} error={error} required={required} className={className}>
      <select
        id={name}
        {...register(name)}
        className={cn(
          "w-full px-4 py-3 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200",
          error && "border-red-300 focus:ring-red-500"
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

interface TextAreaFieldProps {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  register: any;
  error?: any;
  required?: boolean;
  className?: string;
}

export function TextAreaField({
  label,
  name,
  placeholder,
  rows = 4,
  register,
  error,
  required,
  className
}: TextAreaFieldProps) {
  return (
    <FormField label={label} name={name} register={register} error={error} required={required} className={className}>
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        {...register(name)}
        className={cn(
          "w-full px-4 py-3 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none",
          error && "border-red-300 focus:ring-red-500"
        )}
      />
    </FormField>
  );
}

interface ImageUploadFieldProps {
  label: string;
  name: string;
  register: any;
  error?: any;
  setValue: any;
  watch: any;
  required?: boolean;
  className?: string;
}

export function ImageUploadField({
  label,
  name,
  register,
  error,
  setValue,
  watch,
  required,
  className
}: ImageUploadFieldProps) {
  const currentImage = watch(name);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        setValue(name, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setValue(name, null);
  };

  return (
    <FormField label={label} name={name} register={register} error={error} required={required} className={className}>
      <div className="space-y-4">
        {preview ? (
          <div className="relative inline-block">
            <Image
              src={preview}
              alt="Preview"
              width={120}
              height={120}
              className="w-30 h-30 object-cover rounded-xl border border-neutral-200"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="w-30 h-30 border-2 border-dashed border-neutral-300 rounded-xl flex flex-col items-center justify-center text-neutral-500 hover:border-primary-400 hover:text-primary-600 transition-colors">
            <Upload className="w-8 h-8 mb-2" />
            <span className="text-sm">Upload Image</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 transition-all duration-200"
        />
      </div>
    </FormField>
  );
}

export default BaseForm;