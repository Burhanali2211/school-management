"use client";

import { BellIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Announcement {
  id: string | number;
  title: string;
  description: string;
  date: string | Date;
}

interface AnnouncementsClientProps {
  announcements: Announcement[];
}

const AnnouncementsClient = ({ announcements }: AnnouncementsClientProps) => {
  const formatDate = (dateValue: string | Date): string => {
    try {
      const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return new Intl.DateTimeFormat("en-GB").format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  return (
    <Card className="h-fit">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BellIcon className="w-5 h-5 text-primary-500" />
          <h1 className="text-xl font-semibold text-secondary-900">Announcements</h1>
        </div>
        <span className="text-sm text-primary-500 font-medium">
          View All
        </span>
      </div>
      
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-secondary-500">
            <BellIcon className="w-12 h-12 mx-auto mb-3 text-secondary-300" />
            <p>No announcements yet</p>
          </div>
        ) : (
          announcements.slice(0, 3).map((announcement, index) => {
            const bgColors = [
              'bg-gradient-to-r from-blue-50 to-blue-100',
              'bg-gradient-to-r from-purple-50 to-purple-100',
              'bg-gradient-to-r from-green-50 to-green-100',
            ];
            
            return (
              <div key={announcement.id} className={`${bgColors[index]} rounded-xl p-4 border border-opacity-20`}>
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-secondary-900 mb-2">{announcement.title}</h3>
                  <span className="text-xs text-secondary-500 bg-white rounded-full px-2 py-1">
                    {formatDate(announcement.date)}
                  </span>
                </div>
                <p className="text-sm text-secondary-600 line-clamp-2">{announcement.description}</p>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default AnnouncementsClient;