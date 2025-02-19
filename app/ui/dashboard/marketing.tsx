"use client"
import Link from 'next/link';
import React from 'react';
import { links } from './nav-links';
import { useSession } from '@/app/context';

const Marketing = () => {
  const session = useSession();

  return (
    <div className="grid w-[95%] grid-cols-1 md:grid-cols-3 gap-2">
    {links
      .filter(permisions => permisions.roles.includes(session.user.role))
      .map(element => (
        <Link href={`${element.href}`} key={element.href}>
          <div className="flex h-[100%] items-center bg-gray-600 p-4 rounded-lg shadow-md hover:bg-gray-700 transition-all">
            <element.icon width={200} className="mr-2 text-gray-100" />
            <p className="text-gray-100 font-semibold">{element.name}</p>
          </div>
        </Link>
      ))}
  </div>
  
  );
};

export default Marketing;
