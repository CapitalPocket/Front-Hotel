"use client"; 

import { useState } from "react";
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const DownloadExcelButton = (idpark: any, month: any) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true);
        try {
            console.log(idpark, month)
            const response = await fetch(`${window.location.origin}/dashboard/generar-excel/${idpark}/${month}`);
          
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
        <button onClick={handleDownload} disabled={loading} className=" flex mb-2 rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700">
            <ArrowDownTrayIcon className="w-6 mr-3" />
            <div className="hidden md:block">{loading ? 'Descargando...' : 'Descargar'}</div>
        </button>
    );
};

export default DownloadExcelButton;
