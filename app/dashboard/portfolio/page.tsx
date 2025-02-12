"use client";
import Portfolio from '@/app/ui/portfolio/index';
import React, { useState } from 'react';

const Page = () => {
  const [park, setPark] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col items-center bg-gray-100 px-6">
      <h1 className="text-3xl font-bold my-6 text-center">
        Pagos {park === 'PN' ? 'Heron I' : 'Heron II'}
      </h1>

      <div className="flex items-center p-2 justify-between w-full max-w-md mx-auto space-x-4">
        <button
          onClick={() => setPark('PN')}
          className={`flex-1 h-12 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300 ${
            park === 'PN' ? 'ring-2 ring-gray-300' : ''
          }`}
        >
          Heron I
        </button>
      <button
          onClick={() => setPark('AP')}
          className={`flex-1 h-12 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-300 ${
            park === 'AP' ? 'ring-2 ring-gray-300' : ''
          }`}
        >
          Heron II
        </button>
      </div>

      <div className="flex-grow w-full max-w-7xl mx-auto mt-10 px-4">
        {park === 'PN' && <Portfolio park={"Heron I"} />}
        {park === 'AP' && <Portfolio park={"Heron II"} />}
      </div>
    </div>
  );
};

export default Page;
