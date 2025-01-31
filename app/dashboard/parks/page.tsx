'use client';

import React, { useEffect, useState } from 'react';
import HotelView from '@/app/ui/calendar/calendar'; // Importa el componente del hotel

const Page = () => {
  const [park, setPark] = useState<string | null>(null);

  // Cargar la selección de hotel desde localStorage al iniciar
  useEffect(() => {
    const savedPark = localStorage.getItem('park');
    if (savedPark) setPark(savedPark); // Si existe una selección guardada, usarla
  }, []);

  // Guardar la selección de hotel en localStorage cada vez que cambie el estado 'park'
  useEffect(() => {
    if (park) localStorage.setItem('park', park);
  }, [park]);

  return (
    <div className="h-screen flex flex-col items-center justify-between bg-gray-100 overflow-y-auto">
      <h1 className="text-2xl font-bold my-[2.5%] text-center">
        Empleados en {park === 'PN' ? 'Heron I' : park === 'AP' ? 'Heron II' : '...'} por habitación
      </h1>
      <div className="flex items-center p-2 justify-between w-full max-w-sm mx-auto space-x-2">
        <button
          onClick={() => setPark('PN')}
          className={`flex-1 h-10 bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded transition duration-300 ${park === 'PN' ? 'ring-2 ring-gray-300' : ''}`}
        >
          Heron I
        </button>
        <button
          onClick={() => setPark('AP')}
          className={`flex-1 h-10 bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded transition duration-300 ${park === 'AP' ? 'ring-2 ring-gray-300' : ''}`}
        >
          Heron II
        </button>
      </div>
      <div className="flex-grow w-full max-w-6xl mx-auto mt-8">
        {park === 'PN' && <HotelView park="Heron I" />}
        {park === 'AP' && <HotelView park="Heron II" />}
        {!park && (
          <div className="text-center text-gray-500">
            <p>Selecciona una opción para ver los pisos y empleados.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
