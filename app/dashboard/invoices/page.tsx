'use client';
import React from 'react';
import EmployeeSchedule from '@/app/ui/invoices';

const Page = () => {
  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Se renderiza directamente el calendario */}
      <div className="flex-grow w-full bg-white shadow-md rounded-lg overflow-hidden">
        <EmployeeSchedule park="Heron I" />
      </div>
    </div>
  );
};

export default Page;
