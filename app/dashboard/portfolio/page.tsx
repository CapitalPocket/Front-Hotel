"use client";
import Portfolio from '@/app/ui/portfolio/index';
import React, { useState } from 'react';

const Page = () => {
  // Valor por defecto: 'PN' (Heron I)
  const [park] = useState<string>('PN'); // Ya no necesitas cambiarlo, así que no usas setPark

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 px-6">
      <h1 className="text-3xl font-bold my-6 text-center">Pagos</h1>

      <div className="w-full max-w-7xl mx-auto mt-10 px-4">
        <Portfolio park="Heron I" />
      </div>
    </div>
  );
};

export default Page;
