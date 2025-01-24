import { TicketIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

const TicketOffice = () => {
  return (
    <div className="w-[50%]">
      <Link href="/dashboard/tickets">
        <div className="flex h-full items-center bg-gray-200 p-4">
          <TicketIcon width={300} className="mr-2 text-blue-500" />
          <p className="text-lg font-semibold">Tickets</p>
        </div>
      </Link>
    </div>
  );
};

export default TicketOffice;
