"use client";

import { useState, useEffect } from "react";
import AnnouncementsClient from "./AnnouncementsClient";

interface Announcement {
  id: number;
  title: string;
  description: string;
  date: string;
  classId?: number;
  class?: {
    name: string;
  };
}

const Announcements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/announcements');
      
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data.announcements || []);
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold">Announcements</h1>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <AnnouncementsClient announcements={announcements} />;
};

export default Announcements;
