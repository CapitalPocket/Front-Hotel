"use client";
import Asignacion from '@/app/ui/asignacion/asignacion';
import React, { useState } from 'react';

const Page = () => {
  // Valor por defecto: 'PN' (Heron I)
  const [park] = useState<string>('PN'); // Ya no necesitas cambiarlo, así que no usas setPark

  return (
    <div className="h-screen flex flex-col items-center bg-gray-100 px-6">
      <h1 className="text-3xl font-bold my-6 text-center">Asignacion de habitaciones</h1>

      <div className="flex-grow w-full max-w-7xl mx-auto mt-10 px-4">
        <Asignacion  />
      </div>
    </div>
  );
};

export default Page;
