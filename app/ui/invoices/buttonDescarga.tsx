'use client'; // Asegúrate de incluir esta línea para habilitar el modo cliente en Next.js

import { useState } from 'react';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const DownloadExcelButton = (idpark: any) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${window.location.origin}/dashboard/generar-excel/?idpark=${idpark.idpark}&month=${idpark.month}`,
      );
      if (!response.ok) {
        throw new Error('Error al generar el archivo');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'InformeFacturas.xlsx'; 
      document.body.appendChild(a);
      a.click();
   
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className=" mb-2 flex rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
    >
      <ArrowDownTrayIcon className="mr-3 w-6" />
      <div className="block">
        {loading ? 'Descargando...' : 'Descargar'}
      </div>
    </button>
  );
};

export default DownloadExcelButton;
