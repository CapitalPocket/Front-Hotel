'use client';

import { useState } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function StatusButton() {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(""); 
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const updateStatus = (status: string) => {
    setSelectedStatus(status); 

    const params = new URLSearchParams(searchParams);
    if (status) {
      params.set('statusPerfil', status);
    } else {
      params.delete('statusPerfil');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  const getButtonClasses = (status: string) =>
    selectedStatus === status
      ? 'bg-blue-600 text-white' 
      : 'bg-gray-400 text-gray-100 hover:bg-gray-500'; 

  return (
    <div className="relative flex flex-col items-start space-y-2 p-2 rounded-lg">
      <div className="flex w-full md:w-[30%] space-x-2">
        <button
          onClick={() => updateStatus('Habilitado')}
          className={`flex-1 py-2 rounded-md ${getButtonClasses('Habilitado')}`}
        >
          Habilitados
        </button>
        <button
          onClick={() => updateStatus('Deshabilitado')}
          className={`flex-1 py-2 rounded-md ${getButtonClasses('Deshabilitado')}`}
        >
          Deshabilitados
        </button>
        <button
          onClick={() => updateStatus('Eliminado')}
          className={`flex-1 py-2 rounded-md ${getButtonClasses('Eliminado')}`}
        >
          Eliminados
        </button>
      </div>
    </div>
  );
}
