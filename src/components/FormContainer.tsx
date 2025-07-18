"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { toast } from "react-toastify";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};

const FormContainer = ({ table, type, data, id }: FormContainerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-success-500 hover:bg-success-600"
      : type === "update"
      ? "bg-primary-500 hover:bg-primary-600"
      : "bg-error-500 hover:bg-error-600";

  const IconComponent =
    type === "create" ? Plus :
    type === "update" ? Edit :
    Trash2;

  const iconSize = type === "create" ? 16 : 14;

  const handleAction = async () => {
    if (type === "delete") {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`${table} deleted successfully!`);
        setIsOpen(false);
        // In a real app, you would refresh the data here
        window.location.reload();
      } catch (error) {
        toast.error(`Failed to delete ${table}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      // For create/update, we'll show a placeholder form
      toast.info(`${type === "create" ? "Create" : "Update"} ${table} form would open here`);
      setIsOpen(false);
    }
  };

  const getModalTitle = () => {
    switch (type) {
      case "create":
        return `Create New ${table.charAt(0).toUpperCase() + table.slice(1)}`;
      case "update":
        return `Update ${table.charAt(0).toUpperCase() + table.slice(1)}`;
      case "delete":
        return `Delete ${table.charAt(0).toUpperCase() + table.slice(1)}`;
      default:
        return "";
    }
  };

  const renderModalContent = () => {
    if (type === "delete") {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-error-50 rounded-lg border border-error-200">
            <div className="w-10 h-10 bg-error-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-error-600" />
            </div>
            <div>
              <h4 className="font-medium text-error-900">Confirm Deletion</h4>
              <p className="text-sm text-error-700">This action cannot be undone.</p>
            </div>
          </div>

          <p className="text-secondary-700">
            Are you sure you want to delete this {table}? All associated data will be permanently removed.
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleAction}
              loading={isLoading}
            >
              Delete {table.charAt(0).toUpperCase() + table.slice(1)}
            </Button>
          </div>
        </div>
      );
    }

    // For create/update, show a placeholder form
    return (
      <div className="space-y-4">
        <div className="p-8 text-center bg-secondary-50 rounded-lg border-2 border-dashed border-secondary-300">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconComponent className="w-6 h-6 text-primary-600" />
          </div>
          <h4 className="font-medium text-secondary-900 mb-2">
            {type === "create" ? "Create" : "Update"} {table.charAt(0).toUpperCase() + table.slice(1)} Form
          </h4>
          <p className="text-sm text-secondary-600 mb-4">
            This would contain the actual form for {type === "create" ? "creating" : "updating"} a {table}.
          </p>
          <Button onClick={handleAction}>
            {type === "create" ? "Create" : "Update"} {table.charAt(0).toUpperCase() + table.slice(1)}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`${size} flex items-center justify-center rounded-full ${bgColor} cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105`}
        title={`${type.charAt(0).toUpperCase() + type.slice(1)} ${table}`}
      >
        <IconComponent className="text-white" size={iconSize} />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={getModalTitle()}
        size={type === "delete" ? "sm" : "md"}
      >
        {renderModalContent()}
      </Modal>
    </>
  );
};

export default FormContainer;
