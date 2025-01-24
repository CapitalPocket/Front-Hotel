"use client"
import Link from 'next/link';
import React from 'react';
import { links } from './nav-links';
import { useSession } from '@/app/context';

const Marketing = () => {
  const session = useSession();

  return (
    <div className="grid w-[95%] grid-cols-1 md:grid-cols-3 gap-2">
      {
        links.filter(permisions => permisions.roles.includes(session.user.role)).map(element => 
          <Link href={`${element.href}`} key={element.href}>
            <div className="flex h-[100%] items-center bg-gray-200 p-4">
                <element.icon width={200} className="mr-2 text-teal-500" />
              <p className="text-lg font-semibold">{element.name}</p>
            </div>
          </Link>
        )
      }
      </div>
  );
};

export default Marketing;
