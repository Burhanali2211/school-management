"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, BookOpen, Calendar, Clock, Award } from "lucide-react";
import FormContainer from "@/components/FormContainer";
import { ExamPreview, usePreviewModal } from '@/components/preview';

interface Exam {
  id: number;
  title?: string;
  startTime: Date;
  endTime: Date;
  lesson: {
    subject: {
      id: number;
      name: string;
    };
    teacher: {
      id: string;
      name: string;
      surname: string;
      username: string;
      email: string | null;
      phone?: string | null;
      address?: string;
      img?: string | null;
      bloodType?: string;
      sex: string;
      createdAt: Date;
      birthday: Date;
    };
    class: {
      id: number;
      name: string;
      capacity?: number;
      supervisorId?: string | null;
      gradeId: number;
      schoolId: number | null;
    };
  };
}

interface ExamsTableWithPreviewProps {
  exams: Exam[];
  columns: { header: string; accessor: string; className?: string }[];
  isAdmin: boolean;
  role?: string;
}

const ExamsTableWithPreview: React.FC<ExamsTableWithPreviewProps> = ({
  exams,
  columns,
  isAdmin,
  role
}) => {
  const { isOpen, selectedItem, isLoading, openPreview, closePreview } = usePreviewModal();

  const handleRowClick = (exam: Exam, event: React.MouseEvent) => {
    // Don't trigger preview if clicking on buttons or links
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    openPreview(exam);
  };

  const renderRow = (item: Exam) => {
    const isUpcoming = new Date(item.startTime) > new Date();
    const examDate = new Date(item.startTime);
    const examTime = examDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
      <TableRow 
        key={item.id} 
        className="hover:bg-primary-50 transition-colors duration-200 cursor-pointer"
        onClick={(e) => handleRowClick(item, e)}
      >
        <TableCell className="py-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Award className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {item.lesson.subject.name}
              </p>
              <p className="text-sm text-neutral-500 truncate">
                {item.title || 'Exam'}
              </p>
            </div>
          </div>
        </TableCell>
        
        <TableCell>
          <Badge variant="secondary">
            {item.lesson.class.name}
          </Badge>
        </TableCell>
        
        <TableCell className="hidden md:table-cell">
          <div className="flex items-center space-x-2">
            {item.lesson.teacher.img && (
              <Image
                src={item.lesson.teacher.img}
                alt={`${item.lesson.teacher.name} ${item.lesson.teacher.surname}`}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-neutral-900">
              {item.lesson.teacher.name} {item.lesson.teacher.surname}
            </span>
          </div>
        </TableCell>
        
        <TableCell className="hidden md:table-cell">
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-900">
                {examDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-neutral-400" />
              <span className="text-sm text-neutral-600">
                {examTime}
              </span>
            </div>
          </div>
        </TableCell>
        
        {(isAdmin || role === "teacher") && (
          <TableCell>
            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => openPreview(item)}
                className="hover:bg-primary-50"
              >
                <Eye className="w-4 h-4" />
              </Button>
              
              <Link href={`/list/exams/${item.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
              
              {(isAdmin || role === "teacher") && (
                <>
                  <FormContainer table="exam" type="update" data={item} />
                  <FormContainer table="exam" type="delete" id={item.id} />
                </>
              )}
            </div>
          </TableCell>
        )}
      </TableRow>
    );
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.accessor} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {exams.map(renderRow)}
        </TableBody>
      </Table>

      {exams.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">No exams found</p>
          <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Preview Modal */}
      <ExamPreview
        isOpen={isOpen}
        onClose={closePreview}
        exam={selectedItem}
        isLoading={isLoading}
      />
    </>
  );
};

export default ExamsTableWithPreview;
