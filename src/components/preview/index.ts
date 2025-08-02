import React from 'react';

// Export all preview components
export { default as ClassPreview } from './ClassPreview';
export { default as ExamPreview } from './ExamPreview';
export { default as SubjectPreview } from './SubjectPreview';
export { default as AnnouncementPreview } from './AnnouncementPreview';
export { default as StudentPreview } from './StudentPreview';
export { default as TeacherPreview } from './TeacherPreview';
export { default as ParentPreview } from './ParentPreview';

// Export base components
export {
  BasePreviewModal,
  PreviewHeader,
  PreviewSection,
  PreviewField,
  PreviewGrid,
  PreviewImage,
  PreviewIcons
} from './BasePreviewModal';

// Types for preview data
export interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

// Common preview hook
export const usePreviewModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const openPreview = (item: any) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  const closePreview = () => {
    setIsOpen(false);
    setSelectedItem(null);
    setIsLoading(false);
  };

  return {
    isOpen,
    selectedItem,
    isLoading,
    setIsLoading,
    openPreview,
    closePreview
  };
};
