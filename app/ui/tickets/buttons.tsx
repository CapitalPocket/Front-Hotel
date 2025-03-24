'use client';
import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';


export function CreateInvoice({
  grupo,
}: {
  grupo: string;
}) {
  const href =  '/dashboard/candidatos/create'
   

  return (
    <Link
      href={href}
      className="flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400/30"
    >
      <span className="hidden md:block">Nuevo Empleado</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateInvoice({ id, grupo, page }: { id: string, grupo: string, page: number }) {
  const href = grupo === 'Buen Comienzo'
    ? '/dashboard/customers/' + id + '/edit?page=' + page
    : '/dashboard/candidatos/' + id + '/edit?page=' + page;
  return (
    <Link
      href={href}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );

  
}

export function CreateHotel({ grupo }: { grupo: string }) {
  const router = useRouter();

  const handleRedirect = () => {
    router.push('/dashboard/redenciones/create'); // Ruta correcta
  };

  return (
    <button
      onClick={handleRedirect}
      className="flex h-10 items-center rounded-lg bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400/30"
    >
      Editar hotel
    </button>
  );
}

