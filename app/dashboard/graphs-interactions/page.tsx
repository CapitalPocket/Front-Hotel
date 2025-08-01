"use client";
import Graphs from '@/app/ui/graphs';
import React, { useState } from 'react';

const Page = () => {
  const [park, setPark] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold my-[2.5%] text-center">Métricas de mensajes del {park == 'PN' ? 'Parque Norte' : 'Aeroparque'}</h1>
      <div className="flex items-center p-2 justify-between w-full max-w-sm mx-auto space-x-2">
        <button
          onClick={() => setPark('PN')}
          className={`flex-1 h-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded transition duration-300 ${
            park === 'PN' ? 'ring-2 ring-blue-300' : ''
          }`}
        >
          Heron I
        </button>
        <button
          onClick={() => setPark('AP')}
          className={`flex-1 h-10 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded transition duration-300 ${
            park === 'AP' ? 'ring-2 ring-green-300' : ''
          }`}
        >
          Heron II
        </button>
      </div>
      <div className="flex-grow w-full max-w-6xl mx-auto mt-8">
       
      </div>
    </div>
  );
};

export default Page;