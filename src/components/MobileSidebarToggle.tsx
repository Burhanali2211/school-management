"use client";

import React from 'react';

interface MobileSidebarToggleProps {
  className?: string;
}

const MobileSidebarToggle: React.FC<MobileSidebarToggleProps> = ({ className = "" }) => {
  const closeSidebar = () => {
    document.getElementById('mobile-sidebar-overlay')?.classList.add('hidden');
  };

  return (
    <button 
      className={`text-white hover:text-gray-300 ${className}`}
      onClick={closeSidebar}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  );
};

export default MobileSidebarToggle;
